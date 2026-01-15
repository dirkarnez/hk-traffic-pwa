import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

interface ETAReport {
    route: string
    destination: string
    waitingAt: string
    vehicles: Vehicle[]
    lastUpdate: Date
}

interface Vehicle {
    company: string,
    eta: Date
}

const fetchJSON = (url: string) => fetch(url).then(resp => resp.json());

const fetchKMBJSON = (url: string) => fetchJSON(url).then(json => {
  return json.data
  .filter((item: any) => !!item["eta"])
  .map((item: any) => {
    var vehicle: Vehicle = {
      company: "KMB",
      eta: new Date(Date.parse(item["eta"]))
    };
    return vehicle;
  });
});
const fetchCityJSON = (url: string) => fetchJSON(url).then(json => {
  return json.data
  .filter((item: any) => !!item["eta"])
  .map((item: any) => {
    var vehicle: Vehicle = {
      company: "Citybus",
      eta: new Date(Date.parse(item["eta"]))
    };
    return vehicle;
  });
});

Promise.all([
  fetchKMBJSON("https://data.etabus.gov.hk/v1/transport/kmb/eta/11B2034DDF30617A/116/1"),
  fetchCityJSON("https://rt.data.gov.hk//v2/transport/citybus/eta/CTB/001475/116")
])
.then(arrayOfJSON => {
  return arrayOfJSON.reduce((p, c) => {
    return [...p, ...c];
  }, [])
})
.then(list => {
  list
  .sort((a: Vehicle, b: Vehicle) => a.eta.getTime() - b.eta.getTime())
  .forEach((vehicle: Vehicle) => {
    console.log(`vehicle ${vehicle.company}: ${vehicle.eta.toLocaleTimeString()}`)
  });
})

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vite.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
