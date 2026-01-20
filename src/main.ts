// import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'

interface ETAReportDOM {
  detailsElement: HTMLDetailsElement,
  summaryElement: HTMLElement,
  orderListElement: HTMLOListElement
}

interface ETAReport {
    routeName: string
    // destination: string
    // waitingAt: string
    vehicles: Vehicle[],
    dom: ETAReportDOM,
    otherPlatforms: OtherPlatform[]
    // lastUpdate: Date
}

interface Vehicle {
    company: string,
    eta: Date,
    dataTime: Date
}

function minutesDiff(date1: Date, date2: Date) {
  // Get the time in milliseconds for both dates
  const time1 = date1.getTime();
  const time2 = date2.getTime();


  // Calculate the difference in milliseconds
  const diffInMilliseconds = Math.abs(time2 - time1); // Use Math.abs for a positive result

  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

  // Calculate minutes (total seconds divided by 60, rounded down)
  // Use the modulo operator (%) to get the remainder when dividing total seconds by 60
  const minutes = Math.floor(diffInSeconds / 60);

  // Calculate remaining seconds (total seconds modulo 60)
  const seconds = diffInSeconds % 60;

  return { minutes, seconds };
}

const fetchJSON = (url: string) => fetch(url, {
  method: 'GET',
  cache: "no-cache"
}).then(resp => resp.json());

const fetchKMBJSON = (url: string): Promise<Vehicle[]> => fetchJSON(url).then(json => {
  return json.data
  .filter((item: any) => !!item["eta"])
  .map((item: any) => {
    var vehicle: Vehicle = {
      company: "KMB",
      eta: new Date(Date.parse(item["eta"])),
      dataTime: new Date(Date.parse(item["data_timestamp"])),
    };
    return vehicle;
  });
});

const fetchCityJSON = (url: string): Promise<Vehicle[]> => fetchJSON(url).then(json => {
  return json.data
  .filter((item: any) => !!item["eta"])
  .map((item: any) => {
    var vehicle: Vehicle = {
      company: "Citybus",
      eta: new Date(Date.parse(item["eta"])),
      dataTime: new Date(Date.parse(item["data_timestamp"])),
    };
    return vehicle;
  });
});

const fetchRoute = (kmbURLs: string[] | null, citybusURLs: string[] | null) => {
  return Promise.all([
    Array.isArray(kmbURLs) ? Promise.all(kmbURLs.map(kmbURL => fetchKMBJSON(kmbURL))) : Promise.resolve(null),
    Array.isArray(citybusURLs) ? Promise.all(citybusURLs.map(citybusURL => fetchCityJSON(citybusURL))) : Promise.resolve(null),
  ])
  .then(companiesJSON => {
    return companiesJSON
    .filter(company => !!company)
    .reduce((p: Vehicle[], companyVehicles: Vehicle[][]) => {
      return [
        ...p,
        ...companyVehicles.reduce((q: Vehicle[], vehicles: Vehicle[]) => {
          return [
            ...q,
            ...vehicles
          ]
        }, [])
      ];
    }, []);

    // .reduce((p: Vehicle[], c: Vehicle[]) => {
    //   return [...p, ...c];
    // }, []);
  })
  // .then(list => {
  //   list
  //   .sort((a: Vehicle, b: Vehicle) => a.eta.getTime() - b.eta.getTime())
  //   .forEach((vehicle: Vehicle) => {
  //     const duration = minutesDiff(vehicle.eta, vehicle.dataTime);
  //     console.log();
  //   });
  // });
}

interface OtherPlatform {
  url: string,
  name: string
}

interface Route {
  name: string,
  kmbURL: string[] | null,
  citybusURL: string[] | null,
  otherPlatforms: OtherPlatform[]
}

const myRoutes: Route[] = [
  {
    name: "116 - HH to Tak Oi",
    kmbURL: ["https://data.etabus.gov.hk/v1/transport/kmb/eta/11B2034DDF30617A/116/1"],
    citybusURL: ["https://rt.data.gov.hk//v2/transport/citybus/eta/CTB/001475/116"],
    otherPlatforms: [
      {
        name: "hkbus.app",
        url: "https://hkbus.app/zh/route/116-1-quarry-bay-(yau-man-street)-tsz-wan-shan-(central)/001475%2C12"
      }
    ]
  },
  {
    name: "793 - TKL to TKO",
    kmbURL: null,
    citybusURL: ["https://rt.data.gov.hk//v2/transport/citybus/eta/CTB/002917/793" ],
    otherPlatforms: [
      {
        name: "hkbus.app",
        url: "https://hkbus.app/zh/route/793-1-so-uk-tseung-kwan-o-industrial-estate/002917%2C26"
      }
    ]
  },
  {
    name: "793 - Mikiki to TKO",
    kmbURL: null,
    citybusURL: ["https://rt.data.gov.hk//v2/transport/citybus/eta/CTB/001573/793"],
    otherPlatforms: [
      {
        name: "hkbus.app",
        url: "https://hkbus.app/zh/route/793-1-so-uk-tseung-kwan-o-industrial-estate/001573%2C19"
      }
    ]
  },
  {
    name: "796X - TKO 先進製造業中心, 駿光街 to HH",
    kmbURL: null,
    citybusURL: ["https://rt.data.gov.hk//v2/transport/citybus/eta/CTB/002927/796X"],
    otherPlatforms: [
      {
        name: "hkbus.app",
        url: ""
      }
    ]
  },
  {
    name: "796X - TKO 日出康城領都, 環保大道 to HH",
    kmbURL: null,
    citybusURL: ["https://rt.data.gov.hk//v2/transport/citybus/eta/CTB/002928/796X"],
    otherPlatforms: [
      {
        name: "hkbus.app",
        url: ""
      }
    ]
  }
];

((container: HTMLDivElement | null) => {
  if (!container) {
    return;
  }

  Promise
    .all(myRoutes.map(myRoute => {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      details.open = true;
      summary.innerHTML = `<div style="display: contents">${myRoute.name} ${myRoute.otherPlatforms.map(({url, name}) => `<a href="https://www.google.com/search?${url}" target="_blank">${name}</a>`).join("&nbsp;")}</div>`;
      const ol = document.createElement("ol");
      details.appendChild(ol);
      details.appendChild(summary);
      container.appendChild(details);
      return fetchRoute(myRoute.kmbURL, myRoute.citybusURL)
        .then((vehicles): ETAReport => ({
          routeName: myRoute.name, 
          vehicles: vehicles, 
          dom: { 
            detailsElement: details, 
            summaryElement: summary, 
            orderListElement: ol
          },
          otherPlatforms: myRoute.otherPlatforms
        }));
    }))
    .then((etaReportArray: ETAReport[]) => {
      etaReportArray.forEach((etaReport: ETAReport) => {
        etaReport.vehicles
          .sort((a: Vehicle, b: Vehicle) => {
            return a.eta.getTime() - b.eta.getTime();
          })
          .forEach((routeVehicle: Vehicle) => {
            const li = document.createElement("li");
            const duration = minutesDiff(routeVehicle.eta, routeVehicle.dataTime);
            li.innerText = `[${duration.minutes} mins ${duration.seconds} secs] ${routeVehicle.company}`;
            etaReport.dom.orderListElement.appendChild(li);
          });
        });

        
    });
})(document.querySelector<HTMLDivElement>('#app'));

