export interface Cinema {
  id: string;
  name: string;
  network: string;
  address: string;
  neighborhood: string;
  city: string;
  uf: string;
  lat: number | null;
  lng: number | null;
  roomCount: number;
  phones: string[];
  siteUrl: string;
}
