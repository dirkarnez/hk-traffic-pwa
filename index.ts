interface ETAReport {
    route: string
    destination: string
    waitingAt: string
    vehicles: Vehicle[]
    lastUpdate: Date
}

interface Vehicle {
    eta: Date
}
