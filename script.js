function getCSSValue(element, property) {
  const valueStr = getComputedStyle(element)[property]
  const numberRgx = /\d+/g
  return Number(valueStr.match(numberRgx)[0])
}

if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function (stream) {

    const actx = new (window.AudioContext || window.webkitAudioContext)() // define audio context
    const mic = actx.createMediaStreamSource(stream)
    const analyser = actx.createAnalyser()
    const el = document.getElementById('display')

    mic.connect(analyser)
    analyser.fftSize = 4096

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const freqResolution = actx.sampleRate / bufferLength

    // Get canvas context
    const c = document.querySelector("canvas")
    c.width = getCSSValue(c, 'width')
    c.height = getCSSValue(c, 'height')
    
    const ctx = c.getContext("2d")
    const c_width = c.width
    const c_height = c.height
    const lines = c.height / 10
    const buf_cut = bufferLength / lines
    const slice_w = c_width / (buf_cut + 5)
    const slice_h = c_height / lines

    ctx.rect(0, 0, c_width, c_height)
    ctx.lineWidth = 2
    ctx.strokeStyle = '#fff'
    ctx.fillStyle = '#000'

    function drawLine(h_adj, values) {
      let x = 0
      ctx.beginPath()
      ctx.moveTo(x, c_height - h_adj)
      ctx.lineTo(x, c_height - h_adj)
      for (let i = 0; i < values.length; i++) {
        x += slice_w
        ctx.lineTo(x, c_height - h_adj - values[i])
      }
      ctx.lineTo(c_width, c_height - h_adj)
      ctx.fill()
      ctx.stroke()
    }

    function draw() {
      let h = c_height
      ctx.clearRect(0, 0, c_width, c_height)
      analyser.getByteFrequencyData(dataArray)
      for (let i = bufferLength; i > 0; i = i - buf_cut) {
        var data_vals = dataArray.slice(i, i + buf_cut)
        drawLine(h, data_vals)
        h = h - slice_h
      }
      requestAnimationFrame(draw)
    }

    draw()

  })
  .catch(function (err) {
    console.log(err)
  })
}