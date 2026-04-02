'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { db, storage } from '@/lib/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { buildImageVariant, buildResponsiveImageSet, createImageUploadMetadata } from '@/lib/imageUtils';
import { normalizeActivities, normalizeCustomTag, normalizeCustomTags } from '@/lib/tagConfig';
import { getPreferredUserName } from '@/lib/userName';
import { readDemoState, writeDemoState } from '@/lib/demoAccount';

const CoupleContext = createContext(null);

const DEFAULT_CONFIG = {
  palette: 'rosa',
  customTags: [],
};

const INITIAL_FEATURE_FLAGS = {
  entries: false,
  album: false,
  timeline: false,
  phrases: false,
};

function sortMembers(members = []) {
  const order = { owner: 0, partner: 1 };
  return [...members].sort((a, b) => (order[a.role] ?? 99) - (order[b.role] ?? 99));
}

function createLocalId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function buildVariantPath(basePath, variant, extension) {
  return `${basePath}-${variant}.${extension}`;
}

function normalizeEntryRecord(entry = {}) {
  return {
    ...entry,
    activities: normalizeActivities(entry.activities || []),
  };
}

function normalizeConfigRecord(config = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    customTags: normalizeCustomTags(config.customTags || []),
  };
}

export function CoupleProvider({ children }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [coupleId, setCoupleId] = useState(null);
  const [couple, setCouple] = useState(null);
  const [coupleLoading, setCoupleLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [album, setAlbum] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [phrases, setPhrases] = useState([]);
  const [members, setMembers] = useState([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const userUnsubRef = useRef(null);
  const baseCoupleUnsubsRef = useRef([]);
  const featureUnsubsRef = useRef({});
  const activeCoupleRef = useRef(null);
  const demoStateRef = useRef(null);
  const featureReadyRef = useRef(INITIAL_FEATURE_FLAGS);
  const featureLoadingRef = useRef(INITIAL_FEATURE_FLAGS);
  const [featureReady, setFeatureReady] = useState(INITIAL_FEATURE_FLAGS);
  const [featureLoading, setFeatureLoading] = useState(INITIAL_FEATURE_FLAGS);
  const isDemoMode = Boolean(user?.isDemo);

  function setFeatureItems(feature, items) {
    switch (feature) {
      case 'entries':
        setEntries((items || []).map(normalizeEntryRecord));
        return;
      case 'album':
        setAlbum(items);
        return;
      case 'timeline':
        setTimeline(items);
        return;
      case 'phrases':
        setPhrases(items);
        return;
      default:
    }
  }

  function setFeatureReadyState(feature, value) {
    featureReadyRef.current = { ...featureReadyRef.current, [feature]: value };
    setFeatureReady(current => (current[feature] === value ? current : { ...current, [feature]: value }));
  }

  function setFeatureLoadingState(feature, value) {
    featureLoadingRef.current = { ...featureLoadingRef.current, [feature]: value };
    setFeatureLoading(current => (current[feature] === value ? current : { ...current, [feature]: value }));
  }

  function resetFeatureFlags() {
    featureReadyRef.current = INITIAL_FEATURE_FLAGS;
    featureLoadingRef.current = INITIAL_FEATURE_FLAGS;
    setFeatureReady(INITIAL_FEATURE_FLAGS);
    setFeatureLoading(INITIAL_FEATURE_FLAGS);
  }

  function resetCoupleState() {
    setCouple(null);
    setEntries([]);
    setAlbum([]);
    setTimeline([]);
    setPhrases([]);
    setMembers([]);
    setConfig(DEFAULT_CONFIG);
    resetFeatureFlags();
  }

  function cleanupBaseCoupleListeners() {
    baseCoupleUnsubsRef.current.forEach(unsub => unsub());
    baseCoupleUnsubsRef.current = [];
    activeCoupleRef.current = null;
  }

  function cleanupFeatureListeners() {
    Object.values(featureUnsubsRef.current).forEach(unsub => unsub());
    featureUnsubsRef.current = {};
    resetFeatureFlags();
  }

  function cleanupCoupleListeners() {
    cleanupBaseCoupleListeners();
    cleanupFeatureListeners();
    activeCoupleRef.current = null;
  }

  function applyDemoState(state) {
    demoStateRef.current = state;
    setUserProfile(state.userProfile || null);
    setCoupleId(state.coupleId || null);
    setCouple(state.couple || null);
    setEntries((state.entries || []).map(normalizeEntryRecord));
    setAlbum(state.album || []);
    setTimeline(state.timeline || []);
    setPhrases(state.phrases || []);
    setMembers(sortMembers(state.members || []));
    setConfig(normalizeConfigRecord(state.config || {}));
    featureReadyRef.current = { entries: true, album: true, timeline: true, phrases: true };
    featureLoadingRef.current = INITIAL_FEATURE_FLAGS;
    setFeatureReady(featureReadyRef.current);
    setFeatureLoading(INITIAL_FEATURE_FLAGS);
  }

  function updateDemoState(updater) {
    const current = demoStateRef.current || readDemoState();
    const next = updater(current);
    demoStateRef.current = next;
    writeDemoState(next);
    applyDemoState(next);
    return next;
  }

  useEffect(() => {
    cleanupCoupleListeners();
    userUnsubRef.current?.();
    userUnsubRef.current = null;

    if (!user) {
      demoStateRef.current = null;
      setUserProfile(null);
      setCoupleId(null);
      resetCoupleState();
      setCoupleLoading(false);
      return undefined;
    }

    if (user.isDemo) {
      setCoupleLoading(true);
      applyDemoState(readDemoState());
      setCoupleLoading(false);
      return undefined;
    }

    setCoupleLoading(true);
    userUnsubRef.current = onSnapshot(
      doc(db, 'users', user.uid),
      snapshot => {
        const data = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : { id: user.uid };
        const nextCoupleId = data.coupleId || null;

        setUserProfile(data);

        if (activeCoupleRef.current === nextCoupleId) {
          if (!nextCoupleId) setCoupleLoading(false);
          return;
        }

        cleanupCoupleListeners();
        setCoupleId(nextCoupleId);

        if (!nextCoupleId) {
          resetCoupleState();
          setCoupleLoading(false);
          return;
        }

        setCouple(null);
        setMembers([]);
        setConfig(DEFAULT_CONFIG);
        setEntries([]);
        setAlbum([]);
        setTimeline([]);
        setPhrases([]);
        resetFeatureFlags();
        activeCoupleRef.current = nextCoupleId;
        attachCoupleListeners(nextCoupleId);
        setCoupleLoading(false);
      },
      () => {
        setUserProfile({ id: user.uid });
        setCoupleId(null);
        resetCoupleState();
        setCoupleLoading(false);
      },
    );

    return () => {
      cleanupCoupleListeners();
      userUnsubRef.current?.();
      userUnsubRef.current = null;
    };
  }, [user]);

  function attachCoupleListeners(nextCoupleId) {
    const register = unsub => baseCoupleUnsubsRef.current.push(unsub);

    register(
      onSnapshot(doc(db, 'couples', nextCoupleId), snapshot => {
        setCouple(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
      }),
    );

    register(
      onSnapshot(collection(db, 'couples', nextCoupleId, 'members'), snapshot => {
        setMembers(sortMembers(snapshot.docs.map(item => ({ id: item.id, ...item.data() }))));
      }),
    );

    register(
      onSnapshot(doc(db, 'couples', nextCoupleId, 'config', nextCoupleId), snapshot => {
        setConfig(snapshot.exists() ? normalizeConfigRecord(snapshot.data()) : DEFAULT_CONFIG);
      }),
    );
  }

  const ensureFeatureLoaded = useCallback(
    feature => {
      if (isDemoMode) {
        setFeatureReadyState(feature, true);
        setFeatureLoadingState(feature, false);
        return;
      }

      if (!coupleId || featureReadyRef.current[feature] || featureUnsubsRef.current[feature]) {
        return;
      }

      setFeatureLoadingState(feature, true);

      const unsubscribe = onSnapshot(
        collection(db, 'couples', coupleId, feature),
        snapshot => {
          setFeatureItems(
            feature,
            snapshot.docs.map(item => ({ id: item.id, ...item.data() })),
          );
          setFeatureReadyState(feature, true);
          setFeatureLoadingState(feature, false);
        },
        () => {
          setFeatureItems(feature, []);
          setFeatureReadyState(feature, false);
          setFeatureLoadingState(feature, false);
        },
      );

      featureUnsubsRef.current[feature] = () => {
        unsubscribe();
        delete featureUnsubsRef.current[feature];
      };
    },
    [coupleId, isDemoMode],
  );

  const ensureEntriesLoaded = useCallback(() => ensureFeatureLoaded('entries'), [ensureFeatureLoaded]);
  const ensureAlbumLoaded = useCallback(() => ensureFeatureLoaded('album'), [ensureFeatureLoaded]);
  const ensureTimelineLoaded = useCallback(() => ensureFeatureLoaded('timeline'), [ensureFeatureLoaded]);
  const ensurePhrasesLoaded = useCallback(() => ensureFeatureLoaded('phrases'), [ensureFeatureLoaded]);

  const currentMember = useMemo(
    () => members.find(member => member.id === user?.uid) || null,
    [members, user?.uid],
  );

  const partnerMember = useMemo(
    () => members.find(member => member.id !== user?.uid) || null,
    [members, user?.uid],
  );

  const membersById = useMemo(
    () => Object.fromEntries(members.map(member => [member.id, member])),
    [members],
  );

  const isOwner = Boolean(user?.uid && couple?.ownerUid === user.uid);

  function actorMeta() {
    const createdByName = currentMember?.name || userProfile?.name || getPreferredUserName(user);
    return { createdBy: user.uid, createdByName };
  }

  async function uploadSingleImage(file, basePath, options = {}) {
    if (isDemoMode) {
      const asset = await buildImageVariant(file, options);
      return {
        contentType: asset.contentType,
        height: asset.height,
        storagePath: null,
        url: asset.dataUrl,
        width: asset.width,
      };
    }

    const asset = await buildImageVariant(file, options);
    const storagePath = `${basePath}.${asset.extension}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, asset.blob, createImageUploadMetadata(asset.contentType));

    return {
      contentType: asset.contentType,
      height: asset.height,
      storagePath,
      url: await getDownloadURL(storageRef),
      width: asset.width,
    };
  }

  async function uploadResponsiveImage(file, basePath, options = {}) {
    if (isDemoMode) {
      const imageSet = await buildResponsiveImageSet(file, options);
      return {
        contentType: imageSet.full.contentType,
        height: imageSet.full.height,
        storagePath: null,
        thumbStoragePath: null,
        thumbUrl: imageSet.thumb.dataUrl,
        url: imageSet.full.dataUrl,
        width: imageSet.full.width,
      };
    }

    const imageSet = await buildResponsiveImageSet(file, options);
    const fullPath = buildVariantPath(basePath, 'full', imageSet.full.extension);
    const thumbPath = imageSet.thumbIsSeparate
      ? buildVariantPath(basePath, 'thumb', imageSet.thumb.extension)
      : fullPath;
    const fullRef = ref(storage, fullPath);
    const thumbRef = imageSet.thumbIsSeparate ? ref(storage, thumbPath) : fullRef;

    await Promise.all([
      uploadBytes(fullRef, imageSet.full.blob, createImageUploadMetadata(imageSet.full.contentType)),
      imageSet.thumbIsSeparate
        ? uploadBytes(thumbRef, imageSet.thumb.blob, createImageUploadMetadata(imageSet.thumb.contentType))
        : Promise.resolve(),
    ]);

    const [url, thumbUrl] = await Promise.all([
      getDownloadURL(fullRef),
      imageSet.thumbIsSeparate ? getDownloadURL(thumbRef) : Promise.resolve(''),
    ]);

    return {
      contentType: imageSet.full.contentType,
      height: imageSet.full.height,
      storagePath: fullPath,
      thumbStoragePath: imageSet.thumbIsSeparate ? thumbPath : fullPath,
      thumbUrl: imageSet.thumbIsSeparate ? thumbUrl : url,
      url,
      width: imageSet.full.width,
    };
  }

  async function safeDeleteStorage(storagePath) {
    if (isDemoMode || !storagePath) return;

    const paths = Array.isArray(storagePath) ? storagePath : [storagePath];

    await Promise.all(
      paths
        .filter(Boolean)
        .map(async path => {
          try {
            await deleteObject(ref(storage, path));
          } catch {}
        }),
    );
  }

  async function addEntry(entry) {
    const normalizedEntry = {
      ...entry,
      activities: normalizeActivities(entry.activities || []),
    };

    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        entries: [
          ...state.entries,
          {
            id: createLocalId('demo-entry'),
            ...normalizedEntry,
            ...actorMeta(),
            createdAt: nowIso(),
          },
        ],
      }));
      return;
    }

    await addDoc(collection(db, 'couples', coupleId, 'entries'), {
      ...normalizedEntry,
      ...actorMeta(),
      createdAt: serverTimestamp(),
    });
  }

  async function removeEntry(id) {
    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        entries: state.entries.filter(entry => entry.id !== id),
      }));
      return;
    }

    await deleteDoc(doc(db, 'couples', coupleId, 'entries', id));
  }

  async function updateEntry(id, updates) {
    const normalizedUpdates = {
      ...updates,
      ...(updates.activities ? { activities: normalizeActivities(updates.activities) } : {}),
    };

    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        entries: state.entries.map(entry =>
          entry.id === id ? { ...entry, ...normalizedUpdates, updatedAt: nowIso() } : entry,
        ),
      }));
      return;
    }

    await updateDoc(doc(db, 'couples', coupleId, 'entries', id), {
      ...normalizedUpdates,
      updatedAt: serverTimestamp(),
    });
  }

  async function addPhoto(file, metadata) {
    const uploaded = await uploadResponsiveImage(file, `couples/${coupleId}/album/${Date.now()}`, {
      fullWidth: 1920,
      fullQuality: 0.92,
      thumbWidth: 900,
      thumbQuality: 0.86,
    });

    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        album: [
          ...state.album,
          {
            id: createLocalId('demo-photo'),
            ...metadata,
            ...actorMeta(),
            createdAt: nowIso(),
            height: uploaded.height,
            storagePath: uploaded.storagePath,
            thumbStoragePath: uploaded.thumbStoragePath,
            thumbUrl: uploaded.thumbUrl,
            url: uploaded.url,
            width: uploaded.width,
          },
        ],
      }));
      return;
    }

    await addDoc(collection(db, 'couples', coupleId, 'album'), {
      ...metadata,
      ...actorMeta(),
      createdAt: serverTimestamp(),
      height: uploaded.height,
      storagePath: uploaded.storagePath,
      thumbStoragePath: uploaded.thumbStoragePath,
      thumbUrl: uploaded.thumbUrl,
      url: uploaded.url,
      width: uploaded.width,
    });
  }

  async function removePhoto(photo) {
    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        album: state.album.filter(item => item.id !== photo.id),
      }));
      return;
    }

    await safeDeleteStorage([photo.storagePath, photo.thumbStoragePath]);
    await deleteDoc(doc(db, 'couples', coupleId, 'album', photo.id));
  }

  async function saveConfig(updates) {
    const normalizedUpdates = {
      ...updates,
      ...(updates.customTags ? { customTags: normalizeCustomTags(updates.customTags) } : {}),
    };

    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        config: { ...state.config, ...normalizedUpdates, updatedAt: nowIso() },
      }));
      return;
    }

    await setDoc(
      doc(db, 'couples', coupleId, 'config', coupleId),
      { ...normalizedUpdates, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }

  async function saveCoupleNames({ name1, name2 }) {
    if (isDemoMode) {
      updateDemoState(state => {
        const nextMembers = state.members.map(member => {
          if (member.role === 'owner') return { ...member, name: name1, updatedAt: nowIso() };
          if (member.role === 'partner') return { ...member, name: name2, updatedAt: nowIso() };
          return member;
        });

        const nextUserProfile =
          state.userProfile?.uid === state.couple?.ownerUid
            ? { ...state.userProfile, name: name1 }
            : { ...state.userProfile, name: name2 };

        return {
          ...state,
          userProfile: nextUserProfile,
          members: nextMembers,
          config: { ...state.config, name1, name2, updatedAt: nowIso() },
        };
      });
      return;
    }

    await saveConfig({ name1, name2 });

    if (couple?.ownerUid) {
      await setDoc(
        doc(db, 'couples', coupleId, 'members', couple.ownerUid),
        { name: name1, updatedAt: serverTimestamp() },
        { merge: true },
      );
      await setDoc(doc(db, 'users', couple.ownerUid), { name: name1, updatedAt: serverTimestamp() }, { merge: true });
    }

    if (couple?.partnerUid) {
      await setDoc(
        doc(db, 'couples', coupleId, 'members', couple.partnerUid),
        { name: name2, updatedAt: serverTimestamp() },
        { merge: true },
      );
      await setDoc(doc(db, 'users', couple.partnerUid), { name: name2, updatedAt: serverTimestamp() }, { merge: true });
    }
  }

  async function saveCouplePhoto(file) {
    const uploaded = await uploadSingleImage(file, `couples/${coupleId}/photo/${Date.now()}`, {
      maxWidth: 840,
      quality: 0.8,
    });

    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        config: {
          ...state.config,
          couplePhotoHeight: uploaded.height,
          couplePhotoPath: uploaded.storagePath,
          couplePhotoUrl: uploaded.url,
          couplePhotoWidth: uploaded.width,
          updatedAt: nowIso(),
        },
      }));
      return;
    }

    await safeDeleteStorage(config.couplePhotoPath);
    await saveConfig({
      couplePhotoHeight: uploaded.height,
      couplePhotoPath: uploaded.storagePath,
      couplePhotoUrl: uploaded.url,
      couplePhotoWidth: uploaded.width,
    });
  }

  async function removeCouplePhoto() {
    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        config: {
          ...state.config,
          couplePhotoHeight: null,
          couplePhotoUrl: null,
          couplePhotoPath: null,
          couplePhotoWidth: null,
          updatedAt: nowIso(),
        },
      }));
      return;
    }

    await safeDeleteStorage(config.couplePhotoPath);
    await saveConfig({
      couplePhotoHeight: null,
      couplePhotoPath: null,
      couplePhotoUrl: null,
      couplePhotoWidth: null,
    });
  }

  async function addMilestone(data, photoFile) {
    let photoUrl = null;
    let photoPath = null;
    let photoThumbUrl = null;
    let photoThumbPath = null;
    let photoWidth = null;
    let photoHeight = null;

    if (photoFile) {
      const uploaded = await uploadResponsiveImage(photoFile, `couples/${coupleId}/timeline/${Date.now()}`, {
        fullWidth: 1600,
        fullQuality: 0.9,
        thumbWidth: 760,
        thumbQuality: 0.84,
      });
      photoUrl = uploaded.url;
      photoPath = uploaded.storagePath;
      photoThumbUrl = uploaded.thumbUrl;
      photoThumbPath = uploaded.thumbStoragePath;
      photoWidth = uploaded.width;
      photoHeight = uploaded.height;
    }

    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        timeline: [
          ...state.timeline,
          {
            id: createLocalId('demo-milestone'),
            ...data,
            ...actorMeta(),
            createdAt: nowIso(),
            photoPath,
            photoHeight,
            photoThumbPath,
            photoThumbUrl,
            photoUrl,
            photoWidth,
          },
        ],
      }));
      return;
    }

    await addDoc(collection(db, 'couples', coupleId, 'timeline'), {
      ...data,
      ...actorMeta(),
      createdAt: serverTimestamp(),
      photoPath,
      photoHeight,
      photoThumbPath,
      photoThumbUrl,
      photoUrl,
      photoWidth,
    });
  }

  async function removeMilestone(milestone) {
    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        timeline: state.timeline.filter(item => item.id !== milestone.id),
      }));
      return;
    }

    await safeDeleteStorage([milestone.photoPath, milestone.photoThumbPath]);
    await deleteDoc(doc(db, 'couples', coupleId, 'timeline', milestone.id));
  }

  async function updateMilestone(id, updates, newPhotoFile, clearPhoto = false) {
    if (isDemoMode) {
      let uploadedPhoto = null;

      if (newPhotoFile) {
        uploadedPhoto = await uploadResponsiveImage(newPhotoFile, `couples/${coupleId}/timeline/${Date.now()}`, {
          fullWidth: 1600,
          fullQuality: 0.9,
          thumbWidth: 760,
          thumbQuality: 0.84,
        });
      }

      updateDemoState(state => ({
        ...state,
        timeline: state.timeline.map(item => {
          if (item.id !== id) return item;
          return {
            ...item,
            ...updates,
            photoPath: clearPhoto ? null : item.photoPath,
            photoHeight: clearPhoto ? null : uploadedPhoto?.height || item.photoHeight || null,
            photoThumbPath: clearPhoto ? null : uploadedPhoto?.thumbStoragePath || item.photoThumbPath || null,
            photoThumbUrl: clearPhoto ? null : uploadedPhoto?.thumbUrl || item.photoThumbUrl || item.photoUrl,
            photoUrl: clearPhoto ? null : uploadedPhoto?.url || item.photoUrl,
            photoWidth: clearPhoto ? null : uploadedPhoto?.width || item.photoWidth || null,
            updatedAt: nowIso(),
          };
        }),
      }));
      return;
    }

    const current = timeline.find(item => item.id === id);
    const photoUpdates = {};

    if (clearPhoto && current?.photoPath) {
      await safeDeleteStorage([current.photoPath, current.photoThumbPath]);
      photoUpdates.photoUrl = null;
      photoUpdates.photoPath = null;
      photoUpdates.photoThumbUrl = null;
      photoUpdates.photoThumbPath = null;
      photoUpdates.photoWidth = null;
      photoUpdates.photoHeight = null;
    }

    if (newPhotoFile) {
      const uploaded = await uploadResponsiveImage(newPhotoFile, `couples/${coupleId}/timeline/${Date.now()}`, {
        fullWidth: 1600,
        fullQuality: 0.9,
        thumbWidth: 760,
        thumbQuality: 0.84,
      });
      await safeDeleteStorage([current?.photoPath, current?.photoThumbPath]);
      photoUpdates.photoUrl = uploaded.url;
      photoUpdates.photoPath = uploaded.storagePath;
      photoUpdates.photoThumbUrl = uploaded.thumbUrl;
      photoUpdates.photoThumbPath = uploaded.thumbStoragePath;
      photoUpdates.photoWidth = uploaded.width;
      photoUpdates.photoHeight = uploaded.height;
    }

    await updateDoc(doc(db, 'couples', coupleId, 'timeline', id), {
      ...updates,
      ...photoUpdates,
      updatedAt: serverTimestamp(),
    });
  }

  async function addPhrase(text) {
    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        phrases: [
          ...state.phrases,
          {
            id: createLocalId('demo-phrase'),
            text,
            ...actorMeta(),
            createdAt: nowIso(),
          },
        ],
      }));
      return;
    }

    await addDoc(collection(db, 'couples', coupleId, 'phrases'), {
      text,
      ...actorMeta(),
      createdAt: serverTimestamp(),
    });
  }

  async function removePhrase(id) {
    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        phrases: state.phrases.filter(phrase => phrase.id !== id),
      }));
      return;
    }

    await deleteDoc(doc(db, 'couples', coupleId, 'phrases', id));
  }

  async function addCustomTag(tag) {
    const normalizedTag = normalizeCustomTag(tag);
    if (!normalizedTag) return;

    const currentTags = normalizeCustomTags(config.customTags || []);
    const exists = currentTags.some(item => item.name.toLowerCase() === normalizedTag.name.toLowerCase());
    if (exists) return;

    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        config: {
          ...state.config,
          customTags: [...normalizeCustomTags(state.config.customTags || []), normalizedTag],
          updatedAt: nowIso(),
        },
      }));
      return;
    }

    await saveConfig({ customTags: [...currentTags, normalizedTag] });
  }

  async function removeCustomTag(name) {
    const normalizedName = normalizeCustomTag({ name })?.name || name;
    const currentTags = normalizeCustomTags(config.customTags || []);

    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        config: {
          ...state.config,
          customTags: normalizeCustomTags(state.config.customTags || []).filter(tag => tag.name !== normalizedName),
          updatedAt: nowIso(),
        },
      }));
      return;
    }

    await saveConfig({ customTags: currentTags.filter(tag => tag.name !== normalizedName) });
  }

  async function clearCoupleData() {
    if (!coupleId) return;

    if (isDemoMode) {
      updateDemoState(state => ({
        ...state,
        entries: [],
        album: [],
        timeline: [],
        phrases: [],
        config: {
          ...state.config,
          couplePhotoHeight: null,
          couplePhotoPath: null,
          couplePhotoUrl: null,
          couplePhotoWidth: null,
          customTags: [],
          startDate: '',
          updatedAt: nowIso(),
        },
      }));
      return;
    }

    const entriesSnap = await getDocs(collection(db, 'couples', coupleId, 'entries'));
    const albumSnap = await getDocs(collection(db, 'couples', coupleId, 'album'));
    const timelineSnap = await getDocs(collection(db, 'couples', coupleId, 'timeline'));
    const phrasesSnap = await getDocs(collection(db, 'couples', coupleId, 'phrases'));

    await Promise.all([
      ...albumSnap.docs.map(item => safeDeleteStorage([item.data().storagePath, item.data().thumbStoragePath])),
      ...timelineSnap.docs.map(item => safeDeleteStorage([item.data().photoPath, item.data().photoThumbPath])),
      safeDeleteStorage(config.couplePhotoPath),
    ]);

    const batch = writeBatch(db);

    [...entriesSnap.docs, ...albumSnap.docs, ...timelineSnap.docs, ...phrasesSnap.docs].forEach(item => {
      batch.delete(item.ref);
    });

    await batch.commit();

    await setDoc(
      doc(db, 'couples', coupleId, 'config', coupleId),
      {
        couplePhotoHeight: null,
        couplePhotoPath: null,
        couplePhotoUrl: null,
        couplePhotoWidth: null,
        customTags: [],
        startDate: '',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  const value = {
    coupleId,
    couple,
    coupleLoading,
    userProfile,
    members,
    membersById,
    currentMember,
    partnerMember,
    isOwner,
    isDemoMode,
    entries,
    entriesReady: featureReady.entries,
    entriesLoading: featureLoading.entries,
    album,
    albumReady: featureReady.album,
    albumLoading: featureLoading.album,
    timeline,
    timelineReady: featureReady.timeline,
    timelineLoading: featureLoading.timeline,
    phrases,
    phrasesReady: featureReady.phrases,
    phrasesLoading: featureLoading.phrases,
    config,
    ensureEntriesLoaded,
    ensureAlbumLoaded,
    ensureTimelineLoaded,
    ensurePhrasesLoaded,
    addEntry,
    removeEntry,
    updateEntry,
    addPhoto,
    removePhoto,
    saveConfig,
    saveCoupleNames,
    saveCouplePhoto,
    removeCouplePhoto,
    addMilestone,
    removeMilestone,
    updateMilestone,
    addPhrase,
    removePhrase,
    addCustomTag,
    removeCustomTag,
    clearCoupleData,
  };

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>;
}

export function useCouple() {
  const context = useContext(CoupleContext);
  if (!context) throw new Error('useCouple must be used within CoupleProvider');
  return context;
}
