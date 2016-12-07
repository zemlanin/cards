const React = window.React
const h = React.createElement
const ReactDOM = window.ReactDOM

const CARDS = {
  "0": {
    id: "0",
    text: "a",
    color: "red",
  },
  "1": {
    id: "1",
    text: "b",
    color: "green",
  },
  "2": {
    id: "2",
    text: "c",
    color: "blue",
  },
  "3": {
    id: "3",
    text: "d",
    color: "orange",
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

const img = new Image()
img.src = 'http://lorempixel.com/280/360'

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

          return h("div", {
              className: `card card-${handCard.cardId} ${state.draggedCard === handCard.handId ? 'dragged' : ''}`,
              draggable: true,
              key: handCard.handId,
              style: {
                backgroundColor: card.color,
                transform: `rotate(${angle}deg) translateY(${translateY}px)`,
              },
              onDragStart: (ev) => {
                const text = CARDS[handCard.cardId].text
                const color = CARDS[handCard.cardId].color
                ev.dataTransfer.setData('application/json', JSON.stringify(handCard))

                ev.dataTransfer.setDragImage(img, img.width * 0.3, img.height * 0.7)
                window.state.draggedCard = handCard.handId
                window.render()
              },
              onDragEnd: (ev) => {
                window.state.draggedCard = null
                window.render()
              },
            },
            card.text
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
