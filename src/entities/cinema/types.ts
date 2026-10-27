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
  /** "00000-000", or empty */
  postalCode: string;
  /** Image from the catalog (usually the network logo), or empty */
  image: string;
}
