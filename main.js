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
    handId: drawACard.handIdIncr++,
  }
}
drawACard.handIdIncr = 0

const noop = () => {}

/*
  node: {
    
  }

  event: {
    handle: (model, prevNode, info) => {model, nextNode}
  }
*/

const STATE_MACHINE = {
  nodes: {
    empty: {},
    idle: {},
    draggingCard: {},
  },
  events: {
    init: {
      handle: (model, prevNode, info) => {
        return {
          model: {
            hand: [drawACard(), drawACard(), drawACard(), drawACard()],
            draggedCard: null,
            fieldColor: null,
          },
          nextNode: 'idle',
        }
      },
    },
    dragCard: {
      handle: (model, prevNode, info) => {
        const { handCard, onDragStartEvent } = info

        const text = CARDS[handCard.cardId].text
        const color = CARDS[handCard.cardId].color
        onDragStartEvent.dataTransfer.setData('application/json', JSON.stringify(handCard))

        return {
          model: Object.assign({}, model, {draggedCard: handCard.handId}),
          nextNode: 'draggingCard',
        }
      }
    },
    dropCard: {
      handle: (model, prevNode, info) => {
        return {
          model: Object.assign({}, model, {draggedCard: null}),
          nextNode: 'idle',
        }
      },
    },
    playCard: {
      handle: (model, prevNode, info) => {
        const { handCard, onDropEvent } = info

        if (onDropEvent.dataTransfer.types.some(t => t === 'application/json')) {
          const handCard = JSON.parse(onDropEvent.dataTransfer.getData('application/json'))

          return {
            model: Object.assign({}, model, {
              fieldColor: CARDS[handCard.cardId].color,
              draggedCard: null,
              hand: model.hand.filter(hc => hc.handId !== handCard.handId).concat(drawACard())
            }),
            nextNode: 'idle',
          }
        }
      },
    },
  }
}

let machine = {
  node: 'empty',
  model: {},
}

function fireEvent(eventName, info) {
  const { model, nextNode } = STATE_MACHINE.events[eventName].handle(
    machine.model,
    eventName,
    info
  )

  ReactDOM.render(h(UI, model), document.body)

  machine = { node: nextNode, model }
}

const UI = (state) => {
  return h("div", {id: "wrapper"},
    h("div", {
      id: "field",
      style: {
        background: state.fieldColor,
      },
      onDragOver: (ev) => ev.preventDefault(),
      onDrop: (onDropEvent) => fireEvent('playCard', {onDropEvent}),
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
              onDragStart: (onDragStartEvent) => fireEvent('dragCard', {handCard, onDragStartEvent}),
              onDragEnd: () => fireEvent('dropCard'),
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

fireEvent('init')
