const React = window.React
const h = React.createElement
const ReactDOM = window.ReactDOM

const CARDS = {
  "0": {
    id: "0",
    text: "a",
    color: "red",
    icon: 'M70 40 L100 90 L40 90 Z',
  },
  "1": {
    id: "1",
    text: "b",
    color: "green",
    icon: 'M100 30 L100 90 L40 90 L40 30 Z',
  },
  "2": {
    id: "2",
    text: "c",
    color: "blue",
    icon: 'M100 30 L100 90 L40 90 L40 30 L70 60 Z',
  },
  "3": {
    id: "3",
    text: "d",
    color: "orange",
    icon: 'M100 30 L100 50 L60 90 L40 90 L40 70 L80 30 Z',
  },
}

function drawACard() {
  const cardsIds = Object.keys(CARDS)
  const r = Math.floor(Math.random() * cardsIds.length)

  return {
    cardId: cardsIds[r],
    handId: window.state.handIdIncr++,
  }
}

const UI = (state) => {
  return h("div", {id: "wrapper"},
    h("div", {
      id: "field",
      style: {
        background: state.fieldColor,
      },
      onDragOver: (ev) => { ev.preventDefault() },
      onDrop: (ev) => {
        if (ev.dataTransfer.types.some(t => t === 'application/json')) {
          const handCard = JSON.parse(ev.dataTransfer.getData('application/json'))

          window.state.fieldColor = CARDS[handCard.cardId].color
          window.state.draggedCard = null
          window.state.hand = window.state.hand
            .filter(hc => hc.handId !== handCard.handId)
            .concat(drawACard())
          window.render()
        }
      }
    }),
    h("div", {id: "hand"},
      state.hand
        .map((handCard, i, hand) => {
          const card = CARDS[handCard.cardId]
          const angle = (40 / hand.length) * (i - ((hand.length - 1) / 2.0))
          const translateY = 1000 * (0.1 + (
            Math.cos(30 * Math.PI / 180) - Math.cos(angle * Math.PI / 180)
          ))

          const isDragged = state.draggedCard === handCard.handId

          return h("div", {
              key: handCard.handId,
              draggable: true,
              onDragStart: (ev) => {
                const text = CARDS[handCard.cardId].text
                const color = CARDS[handCard.cardId].color
                ev.dataTransfer.setData('application/json', JSON.stringify(handCard))

                window.state.draggedCard = handCard.handId
                window.render()
              },
              onDragEnd: (ev) => {
                window.state.draggedCard = null
                window.render()
              },
            },
            h("svg", {
                className: `card ${isDragged ? 'dragged' : ''}`,
                viewBox: '0 0 140 180',
                style: {
                  backgroundColor: card.color,
                },
              },
              h("path", {stroke: 'white', fill: 'transparent', d: card.icon, strokeWidth: 10}),
              h("text", {stroke: 'white', fill: 'white', x: 50, y: 160, textAnchor: 'center'}, card.text)
            )
          )
        })
      )
    )
}

window.state = window.state || {
  hand: [],
  handIdIncr: 0,
  draggedCard: null,
  fieldColor: null,
}

window.render = () => ReactDOM.render(h(UI, window.state), document.body)

window.state.hand.push(drawACard())
window.state.hand.push(drawACard())
window.state.hand.push(drawACard())
window.state.hand.push(drawACard())

window.render()
