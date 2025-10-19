export interface Size {
  width: number
  height: number
}

export interface Dimensions {
  width: number
  height: number
  pixelRatio: number
}

export interface Position {
  x: number
  y: number
}

export interface PatientInfo {
  patientName: string
  age: number
  gender: string
  chiefComplaint: string
}

// Web3 Types
declare global {
  interface Window {
    ethereum?: any
  }
}
