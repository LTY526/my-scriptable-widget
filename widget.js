// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: quote-right;

// Takes iOS 15 widget's parameter as username
const user = args.widgetParameter != null ? args.widgetParameter : "root"

// OpenWeatherMap's API key.
const openWeatherAPIKey = "<Insert your key here>"

// Runs weather related information
let info = await fetchOpenWeather();

// Uses the weather related information in creating the widget
const widget = createWidget(info)
Script.setWidget(widget)
Script.complete()

async function fetchOpenWeather() {
  // Initializes local FileManager
  const fm = FileManager.local()

  // Loads cached result
  let locationCachePath = FileManager.local().bookmarkedPath("location.json")
  let weatherCachePath = FileManager.local().bookmarkedPath("weather.json")

  // Tries to fetch current location
  const location = await Location.current().catch(onRejected => {
    return JSON.parse(fm.readString(locationCachePath)) 
  })

  // Caches the location information
  fm.writeString(locationCachePath, JSON.stringify(location))

  // Tries to fetch weather information from openweathermap
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude.toString()}&lon=${location.longitude.toString()}&appid=${openWeatherAPIKey}`
  const request = new Request(url)
  const res = await request.loadJSON().catch(onRejected => {
    return JSON.parse(fm.readString(weatherCachePath))
  })
  
  // Caches the weather information
  fm.writeString(weatherCachePath, JSON.stringify(res))
  return res
}

function createWidget(info) {
  const w = new ListWidget()
  const bgColor = new LinearGradient()
  bgColor.colors = [new Color("#29323c"), new Color("#1c1c1c")]
  bgColor.locations = [0.0, 1.0]
  w.backgroundGradient = bgColor
  w.setPadding(12, 15, 15, 12)
  w.spacing = 6

  const time = new Date()
  const dfTime = new DateFormatter()
  dfTime.useMediumDateStyle()
  dfTime.useNoTimeStyle()

  // Username  
  const firstLine = w.addText(`[] user@${user} ~$ now`)
  firstLine.textColor = Color.white()
  firstLine.textOpacity = 0.7
  firstLine.font = new Font("Menlo", 11)
  
  // Date
  const timeLine = w.addText(`[🗓] ${dfTime.string(time)}`)
  timeLine.textColor = Color.white()
  timeLine.font = new Font("Menlo", 11)
  
  // Battery level
  const batteryLine = w.addText(`[🔋] ${renderBattery()}`)
  batteryLine.textColor = new Color("#6ef2ae")
  batteryLine.font = new Font("Menlo", 11)
  
  // Device Model
  const modelLine = w.addText(`[📱] ${Device.model()}`)
  modelLine.textColor = new Color("#ffcc66")
  modelLine.font = new Font("Menlo", 11)
  
  // Location
  const versionLine = w.addText(`[📍] ${info.name}`)
  versionLine.textColor = new Color("#a16584")
  versionLine.font = new Font("Menlo", 11)

  // Weather
  const tempsLine = w.addText(`[🌡] ${(info.main.temp-273.15).toFixed(1)}°C (feels like ${(info.main.feels_like-273.15).toFixed(1)}°C)`)
  tempsLine.textColor = new Color("#6566a1")
  tempsLine.font = new Font("Menlo", 11)

  // For fun
  const extraLine = w.addText(`[${user.toLowerCase().includes("dog") ? "🤡" : "😎" }] Idiot: ${user.toLowerCase().includes("dog") ? "True" : "False" }`)
  extraLine.textColor = Color.white()
  extraLine.font = new Font("Menlo", 11)

  return w
}

function renderBattery() {
  // Value between 0 - 1
  const batteryLevel = Device.batteryLevel()

  // hashes represent available volume
  const juice = "#".repeat(Math.floor(batteryLevel * 8))

  // dots represents used volume
  const used = ".".repeat(8 - juice.length)

  const batteryAscii = `[${juice}${used}] ${Math.round(batteryLevel * 100)}%`
  return batteryAscii
}

// References:
// https://gist.github.com/spencerwooo/7955aefc4ffa5bc8ae7c83d85d05e7a4
// https://docs.scriptable.app/filemanager/