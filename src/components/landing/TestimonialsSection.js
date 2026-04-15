import { Heart, Quote } from 'lucide-react';

const ROW_ONE = [
  {
    couple: 'Ana & Pedro',
    initials: 'A&P',
    time: '3 anos juntos',
    text: 'A gente nem percebia quanto tempo passava junto. Agora a gente briga pra ver quem registra primeiro.',
  },
  {
    couple: 'Isabela & Thiago',
    initials: 'I&T',
    time: '4 anos juntos',
    text: 'O recap do mês virou nosso ritual. A gente senta junto, olha o resumo e fica relembrando cada momento.',
  },
  {
    couple: 'Juliana & Matheus',
    initials: 'J&M',
    time: '2 anos juntos',
    text: 'Ele me mandou o link e eu achei que era bobeira. Agora sou eu que cobro ele pra registrar.',
  },
  {
    couple: 'Beatriz & Henrique',
    initials: 'B&H',
    time: '1 ano e 4 meses juntos',
    text: 'As fotos antes ficavam perdidas na galeria. Agora tão num álbum só nosso, organizado e lindo.',
  },
  {
    couple: 'Carolina & Diego',
    initials: 'C&D',
    time: '8 meses juntos',
    text: 'O mural de recados é a coisa mais fofa. Ele me deixa bilhetinhos e eu só descubro quando abro o app.',
  },
  {
    couple: 'Manuela & Gustavo',
    initials: 'M&G',
    time: '3 anos juntos',
    text: 'Três anos juntos e agora a gente tem cada momento documentado. É como um diário do casal, mas muito mais bonito.',
  },
];

const ROW_TWO = [
  {
    couple: 'Camila & Rafael',
    initials: 'C&R',
    time: '1 ano e 8 meses juntos',
    text: 'Ver a linha do tempo crescendo dá um aperto no coração, do tipo bom. Cada marco me faz lembrar por que escolhi ele.',
  },
  {
    couple: 'Larissa & Gabriel',
    initials: 'L&G',
    time: '1 ano juntos',
    text: 'Nunca achei que um app fosse fazer a gente valorizar mais o tempo junto. Mas faz. Muito.',
  },
  {
    couple: 'Natália & Vinícius',
    initials: 'N&V',
    time: '2 anos e 5 meses juntos',
    text: 'A gente se vê todo dia mas nunca parou pra pensar quanto tempo realmente passa junto. Agora a gente sabe, e é lindo.',
  },
  {
    couple: 'Fernanda & Lucas',
    initials: 'F&L',
    time: '5 meses juntos',
    text: 'Achei que era só mais um app. Mas quando vi nosso primeiro mês registrado, entendi. É sobre valorizar o que a gente tem.',
  },
  {
    couple: 'Sofia & André',
    initials: 'S&A',
    time: '1 ano e 2 meses juntos',
    text: 'O melhor é que os dois usam. Ele registra quando a gente sai, eu registro quando a gente fica em casa. Tudo fica guardado.',
  },
  {
    couple: 'Daniela & Marcos',
    initials: 'D&M',
    time: '6 anos juntos',
    text: 'A gente tava numa fase difícil e começou a usar pra lembrar dos momentos bons. Mudou tudo. Sério.',
  },
];

const MOBILE_CARDS = [ROW_ONE[2], ROW_ONE[4], ROW_TWO[1], ROW_TWO[5]];

function TCard({ couple, initials, text, time }) {
  return (
    <article className="lp-tcard">
      <Quote size={24} className="lp-tcard__quote" aria-hidden="true" />
      <p className="lp-tcard__body">{text}</p>
      <div className="lp-tcard__footer">
        <div className="lp-tcard__avatar" aria-hidden="true">{initials}</div>
        <div className="lp-tcard__meta">
          <span className="lp-tcard__name">{couple}</span>
          <span className="lp-tcard__time">{time}</span>
        </div>
        <div className="lp-tcard__hearts" aria-label="5 estrelas">
          {[0, 1, 2, 3, 4].map(i => (
            <Heart key={i} size={13} fill="currentColor" stroke="none" />
          ))}
        </div>
      </div>
    </article>
  );
}

export default function TestimonialsSection() {
  const rowOneCards = [...ROW_ONE, ...ROW_ONE];
  const rowTwoCards = [...ROW_TWO, ...ROW_TWO];

  return (
    <div className="lp-section-inner lp-section-inner--depoimentos-track">
      <div className="lp-ts-wrap">
        <div className="lp-ts-row">
          <div className="lp-ts-track">
            {rowOneCards.map((item, i) => (
              <TCard key={i} {...item} />
            ))}
          </div>
        </div>

        <div className="lp-ts-row">
          <div className="lp-ts-track lp-ts-track--right">
            {rowTwoCards.map((item, i) => (
              <TCard key={i} {...item} />
            ))}
          </div>
        </div>

        <div className="lp-ts-mobile">
          {MOBILE_CARDS.map((item, i) => (
            <TCard key={i} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
