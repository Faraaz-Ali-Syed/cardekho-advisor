export type FuelType = "Petrol" | "Diesel" | "CNG" | "Electric" | "Hybrid";
export type Transmission = "Manual" | "Automatic";
export type BodyType = "Hatchback" | "Sedan" | "SUV" | "MUV" | "Compact SUV";

export interface Car {
  id: string;
  make: string;
  model: string;
  variant: string;
  bodyType: BodyType;
  priceLakhs: number;           // ex-showroom, INR lakhs
  fuel: FuelType;
  transmission: Transmission;
  mileageKmpl: number;          // or km/charge for EV
  seats: number;
  engineCc: number;             // 0 for EV
  power: number;                // bhp
  safetyStars: number;          // 0-5
  bootLitres: number;
  features: string[];
  rating: number;               // user rating 1-5
  reviewsCount: number;
  pros: string[];
  cons: string[];
  imageColor: string;           // for placeholder card background
}

export interface AdvisorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AdvisorResponse {
  reply: string;
  recommendations?: Array<{
    carId: string;
    reason: string;
  }>;
}
