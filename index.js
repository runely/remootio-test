(async () => {
  const { IP, SECRET_KEY, AUTH_KEY } = require('./config')
  const RemootioDevice = require('remootio-api-client')

  const door = new RemootioDevice(IP, SECRET_KEY, AUTH_KEY)
  let state = false
  let count = 0
  let handler
  console.log('Remootio setup')

  door.on('connecting', () => { console.log('Connecting to', IP) })
  door.on('connected', () => {
    console.log('Connected to', IP)
    door.authenticate()
  })
  door.on('authenticated', () => {
    console.log('Authenticated')
    door.sendHello()

    const changeState = () => {
      if (!state) {
        console.log('Change state to open')
        door.sendOpen()
      } else {
        console.log('Change state to closed')
        door.sendClose()
      }

      count = count++
      state = !state

      if (count === 5) {
        clearInterval(handler)
      }
    }

    handler = setInterval(() => changeState(), 500)
  })
  door.on('error', error => { console.error('Error:', error) })
  door.on('disconnect', error => {
    if (error) console.error('Disconnected - Will exit in 1 second:', error)
    else console.warn('Disconnected - Will exit in 1 second')
    setTimeout(() => { process.exit(0) }, 1000)
  })
  door.on('incomingmessage', (frame, decryptedPayload) => {
    if (!decryptedPayload) return

    if (decryptedPayload.event !== undefined) { // it's a event frame containing a log entry from Remootio
      console.log(`event -- ${decryptedPayload.event.type} -- Incomming message : ${JSON.stringify(decryptedPayload, null, 2)}`)
      if (decryptedPayload.event.type === 'StateChange') {
        // this event is sent by Remootio when the status of the garage door has changed
        console.log(`event -- ${decryptedPayload.event.type} -- State changed to ${decryptedPayload.event.state}`)
      }
      if (decryptedPayload.event.type === 'RelayTrigger') {
        // this event is sent by Remootio when the relay has been triggered
        console.log(`event -- ${decryptedPayload.event.type} -- Relay triggered by '${decryptedPayload.event.data.keyType}' (${decryptedPayload.event.data.keyNr}) via '${decryptedPayload.event.data.via}'. Current state is ${decryptedPayload.event.state}`)
      }
      if (decryptedPayload.event.type === 'SensorFlipped') {
        // this event is sent by Remootio when the sensor logic has been flipped or unflipped. There is no way to tell which it is, so this should be set manually by the user in settings
        console.log(`event -- ${decryptedPayload.event.type} -- Sensor flipped. Update manually in settings`)
      }
      if (decryptedPayload.event.type === 'LeftOpen') {
        // this event is sent by Remootio when the garage door has been left open for the set time duration
        const duration = decryptedPayload.event.data.timeOpen100ms * 0.1 // timeOpen100ms shows how long the gate has been left open in multiples of 100 ms
        console.log(`event -- ${decryptedPayload.event.type} -- Left open for ${duration} seconds`)
      }
    }
  })
  console.log('Listeners setup')

  door.connect(false)
})()
