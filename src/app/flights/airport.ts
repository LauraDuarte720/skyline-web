// Mirror of the backend enums Airport, City and Country
// (com.uniquindio.skyline.domain.valueObject). Keep in sync when the backend changes.

export interface AirportInfo {
  name: string;     // full airport name
  code: string;     // IATA code, what the search endpoint expects (e.g. "BOG")
  city: string;
  country: string;
}

// Keys are the Java enum constant names, which is what FlightResponse sends (e.g. "EL_DORADO").
export const AIRPORTS = {
  // Colombia
  EL_DORADO: { name: 'El Dorado International Airport', code: 'BOG', city: 'Bogotá', country: 'Colombia' },
  JOSE_MARIA_CORDOVA: { name: 'José María Córdova International Airport', code: 'MDE', city: 'Medellín', country: 'Colombia' },
  ALFONSO_BONILLA_ARAGON: { name: 'Alfonso Bonilla Aragón International Airport', code: 'CLO', city: 'Cali', country: 'Colombia' },
  RAFAEL_NUNEZ: { name: 'Rafael Núñez International Airport', code: 'CTG', city: 'Cartagena', country: 'Colombia' },
  ERNESTO_CORTISSOZ: { name: 'Ernesto Cortissoz International Airport', code: 'BAQ', city: 'Barranquilla', country: 'Colombia' },
  SIMON_BOLIVAR: { name: 'Simón Bolívar International Airport', code: 'SMR', city: 'Santa Marta', country: 'Colombia' },
  MATECANA: { name: 'Matecaña International Airport', code: 'PEI', city: 'Pereira', country: 'Colombia' },
  GUSTAVO_ROJAS_PINILLA: { name: 'Gustavo Rojas Pinilla International Airport', code: 'ADZ', city: 'San Andrés', country: 'Colombia' },
  PALONEGRO: { name: 'Palonegro International Airport', code: 'BGA', city: 'Bucaramanga', country: 'Colombia' },
  CAMILO_DAZA: { name: 'Camilo Daza International Airport', code: 'CUC', city: 'Cúcuta', country: 'Colombia' },
  LOS_GARZONES: { name: 'Los Garzones Airport', code: 'MTR', city: 'Montería', country: 'Colombia' },
  ANTONIO_NARINO: { name: 'Antonio Nariño Airport', code: 'PSO', city: 'Pasto', country: 'Colombia' },
  EL_EDEN: { name: 'El Edén International Airport', code: 'AXM', city: 'Armenia', country: 'Colombia' },
  ALMIRANTE_PADILLA: { name: 'Almirante Padilla Airport', code: 'RCH', city: 'Riohacha', country: 'Colombia' },
  ALFONSO_LOPEZ_PUMAREJO: { name: 'Alfonso López Pumarejo Airport', code: 'VUP', city: 'Valledupar', country: 'Colombia' },
  BENITO_SALAS: { name: 'Benito Salas Airport', code: 'NVA', city: 'Neiva', country: 'Colombia' },
  ALFREDO_VASQUEZ_COBO: { name: 'Alfredo Vásquez Cobo International Airport', code: 'LET', city: 'Leticia', country: 'Colombia' },
  YARIGUIES: { name: 'Yariguíes Airport', code: 'EJA', city: 'Barrancabermeja', country: 'Colombia' },
  PERALES: { name: 'Perales Airport', code: 'IBE', city: 'Ibagué', country: 'Colombia' },
  LA_FLORIDA: { name: 'La Florida Airport', code: 'TCO', city: 'Tumaco', country: 'Colombia' },
  GUILLERMO_LEON_VALENCIA: { name: 'Guillermo León Valencia Airport', code: 'PPN', city: 'Popayán', country: 'Colombia' },
  VANGUARDIA: { name: 'Vanguardia Airport', code: 'VVC', city: 'Villavicencio', country: 'Colombia' },
  'EL_CARAÑO': { name: 'El Caraño Airport', code: 'UIB', city: 'Quibdó', country: 'Colombia' },
  JURADO: { name: 'Juradó Airport', code: 'JUO', city: 'Juradó', country: 'Colombia' },
  SAN_JOSE_DEL_GUAVIARE: { name: 'San José del Guaviare Airport', code: 'SJE', city: 'San José del Guaviare', country: 'Colombia' },
  TRES_DE_MAYO: { name: 'Tres de Mayo Airport', code: 'PUU', city: 'Puerto Asís', country: 'Colombia' },
  CESAR_GAVIRIA_TRUJILLO: { name: 'César Gaviria Trujillo Airport', code: 'TME', city: 'Tame', country: 'Colombia' },
  GUSTAVO_ARTUNDUAGA: { name: 'Gustavo Artunduaga Paredes Airport', code: 'FLA', city: 'Florencia', country: 'Colombia' },
  SANTIAGO_VILA: { name: 'Santiago Vila Airport', code: 'GIR', city: 'Girardot', country: 'Colombia' },
  LAS_BRUJAS: { name: 'Las Brujas Airport', code: 'CZU', city: 'Corozal', country: 'Colombia' },
  GOLFO_DE_MORROSQUILLO: { name: 'Golfo de Morrosquillo Airport', code: 'TLU', city: 'Tolú', country: 'Colombia' },

  // United States and Canada
  JFK: { name: 'John F. Kennedy International Airport', code: 'JFK', city: 'New York', country: 'United States' },
  MIAMI_INTERNATIONAL: { name: 'Miami International Airport', code: 'MIA', city: 'Miami', country: 'United States' },
  LAX: { name: 'Los Angeles International Airport', code: 'LAX', city: 'Los Angeles', country: 'United States' },
  ORLANDO_INTERNATIONAL: { name: 'Orlando International Airport', code: 'MCO', city: 'Orlando', country: 'United States' },
  O_HARE: { name: 'O\'Hare International Airport', code: 'ORD', city: 'Chicago', country: 'United States' },
  TORONTO_PEARSON: { name: 'Toronto Pearson International Airport', code: 'YYZ', city: 'Toronto', country: 'Canada' },
  NEWARK_LIBERTY: { name: 'Newark Liberty International Airport', code: 'EWR', city: 'Newark', country: 'United States' },
  SAN_FRANCISCO_INTERNATIONAL: { name: 'San Francisco International Airport', code: 'SFO', city: 'San Francisco', country: 'United States' },
  HARTSFIELD_JACKSON: { name: 'Hartsfield-Jackson Atlanta International Airport', code: 'ATL', city: 'Atlanta', country: 'United States' },
  DALLAS_FORT_WORTH: { name: 'Dallas/Fort Worth International Airport', code: 'DFW', city: 'Dallas', country: 'United States' },
  VANCOUVER_INTERNATIONAL: { name: 'Vancouver International Airport', code: 'YVR', city: 'Vancouver', country: 'Canada' },
  MONTREAL_TRUDEAU: { name: 'Montréal-Trudeau International Airport', code: 'YUL', city: 'Montreal', country: 'Canada' },

  // Latin America and the Caribbean
  MEXICO_CITY_INTERNATIONAL: { name: 'Mexico City International Airport', code: 'MEX', city: 'Mexico City', country: 'Mexico' },
  TOCUMEN: { name: 'Tocumen International Airport', code: 'PTY', city: 'Panama City', country: 'Panama' },
  PUNTA_CANA_INTERNATIONAL: { name: 'Punta Cana International Airport', code: 'PUJ', city: 'Punta Cana', country: 'Dominican Republic' },
  JORGE_CHAVEZ: { name: 'Jorge Chávez International Airport', code: 'LIM', city: 'Lima', country: 'Peru' },
  MARISCAL_SUCRE: { name: 'Mariscal Sucre International Airport', code: 'UIO', city: 'Quito', country: 'Ecuador' },
  ARTURO_MERINO_BENITEZ: { name: 'Arturo Merino Benítez International Airport', code: 'SCL', city: 'Santiago', country: 'Chile' },
  EZEIZA: { name: 'Ministro Pistarini International Airport', code: 'EZE', city: 'Buenos Aires', country: 'Argentina' },
  GUARULHOS: { name: 'São Paulo/Guarulhos International Airport', code: 'GRU', city: 'São Paulo', country: 'Brazil' },
  GALEAO: { name: 'Rio de Janeiro/Galeão International Airport', code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil' },
  CANCUN: { name: 'Cancún International Airport', code: 'CUN', city: 'Cancún', country: 'Mexico' },
  JOSE_JOAQUIN_DE_OLMEDO: { name: 'José Joaquín de Olmedo International Airport', code: 'GYE', city: 'Guayaquil', country: 'Ecuador' },
  EL_ALTO: { name: 'El Alto International Airport', code: 'LPB', city: 'La Paz', country: 'Bolivia' },
  CARRASCO: { name: 'Carrasco International Airport', code: 'MVD', city: 'Montevideo', country: 'Uruguay' },
  SILVIO_PETTIROSSI: { name: 'Silvio Pettirossi International Airport', code: 'ASU', city: 'Asunción', country: 'Paraguay' },
  LAS_AMERICAS: { name: 'Las Américas International Airport', code: 'SDQ', city: 'Santo Domingo', country: 'Dominican Republic' },
  LUIS_MUNOZ_MARIN: { name: 'Luis Muñoz Marín International Airport', code: 'SJU', city: 'San Juan', country: 'Puerto Rico' },
  GRANTLEY_ADAMS: { name: 'Grantley Adams International Airport', code: 'BGI', city: 'Bridgetown', country: 'Barbados' },
  CHEddi_JAGAN: { name: 'Cheddi Jagan International Airport', code: 'GEO', city: 'Georgetown', country: 'Guyana' },

  // Europe
  ADOLFO_SUAREZ_MADRID: { name: 'Adolfo Suárez Madrid-Barajas Airport', code: 'MAD', city: 'Madrid', country: 'Spain' },
  BARCELONA_EL_PRAT: { name: 'Barcelona-El Prat Airport', code: 'BCN', city: 'Barcelona', country: 'Spain' },
  CHARLES_DE_GAULLE: { name: 'Charles de Gaulle Airport', code: 'CDG', city: 'Paris', country: 'France' },
  HEATHROW: { name: 'Heathrow Airport', code: 'LHR', city: 'London', country: 'United Kingdom' },
  LEONARDO_DA_VINCI: { name: 'Leonardo da Vinci–Fiumicino Airport', code: 'FCO', city: 'Rome', country: 'Italy' },
  SCHIPHOL: { name: 'Amsterdam Airport Schiphol', code: 'AMS', city: 'Amsterdam', country: 'Netherlands' },
  FRANKFURT_MAIN: { name: 'Frankfurt Airport', code: 'FRA', city: 'Frankfurt', country: 'Germany' },
  HUMBERTO_DELGADO: { name: 'Humberto Delgado Airport', code: 'LIS', city: 'Lisbon', country: 'Portugal' },
  ISTANBUL_AIRPORT: { name: 'Istanbul Airport', code: 'IST', city: 'Istanbul', country: 'Turkey' },
  ZURICH: { name: 'Zurich Airport', code: 'ZRH', city: 'Zürich', country: 'Switzerland' },
  VIENNA: { name: 'Vienna International Airport', code: 'VIE', city: 'Vienna', country: 'Austria' },
  ATHENS: { name: 'Athens International Airport', code: 'ATH', city: 'Athens', country: 'Greece' },
  COPENHAGEN: { name: 'Copenhagen Airport', code: 'CPH', city: 'Copenhagen', country: 'Denmark' },
  STOCKHOLM_ARLANDA: { name: 'Stockholm Arlanda Airport', code: 'ARN', city: 'Stockholm', country: 'Sweden' },
  OSLO_GARDERMOEN: { name: 'Oslo Airport', code: 'OSL', city: 'Oslo', country: 'Norway' },
  BRUSSELS: { name: 'Brussels Airport', code: 'BRU', city: 'Brussels', country: 'Belgium' },
  PRAGUE: { name: 'Václav Havel Airport Prague', code: 'PRG', city: 'Prague', country: 'Czech Republic' },
  WARSAW_CHOPIN: { name: 'Warsaw Chopin Airport', code: 'WAW', city: 'Warsaw', country: 'Poland' },
  BUDAPEST: { name: 'Budapest Ferenc Liszt International Airport', code: 'BUD', city: 'Budapest', country: 'Hungary' },
  MUNICH: { name: 'Munich Airport', code: 'MUC', city: 'Munich', country: 'Germany' },

  // Middle East and Asia
  DUBAI_INTERNATIONAL: { name: 'Dubai International Airport', code: 'DXB', city: 'Dubai', country: 'United Arab Emirates' },
  HAMAD: { name: 'Hamad International Airport', code: 'DOH', city: 'Doha', country: 'Qatar' },
  TOKYO_HANEDA: { name: 'Tokyo Haneda Airport', code: 'HND', city: 'Tokyo', country: 'Japan' },
  INCHEON: { name: 'Incheon International Airport', code: 'ICN', city: 'Seoul', country: 'South Korea' },
  BEIJING_CAPITAL: { name: 'Beijing Capital International Airport', code: 'PEK', city: 'Beijing', country: 'China' },
  CHANGI: { name: 'Singapore Changi Airport', code: 'SIN', city: 'Singapore', country: 'Singapore' },
  NARITA: { name: 'Narita International Airport', code: 'NRT', city: 'Narita', country: 'Japan' },
  HONG_KONG: { name: 'Hong Kong International Airport', code: 'HKG', city: 'Hong Kong', country: 'Hong Kong' },
  BANGKOK_SUVARNABHUMI: { name: 'Suvarnabhumi Airport', code: 'BKK', city: 'Bangkok', country: 'Thailand' },
  KUALA_LUMPUR: { name: 'Kuala Lumpur International Airport', code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia' },
  INDIRA_GANDHI: { name: 'Indira Gandhi International Airport', code: 'DEL', city: 'New Delhi', country: 'India' },
  CHHATRAPATI_SHIVAJI: { name: 'Chhatrapati Shivaji Maharaj International Airport', code: 'BOM', city: 'Mumbai', country: 'India' },
  KING_ABDULAZIZ: { name: 'King Abdulaziz International Airport', code: 'JED', city: 'Jeddah', country: 'Saudi Arabia' },
  BEN_GURION: { name: 'Ben Gurion Airport', code: 'TLV', city: 'Tel Aviv', country: 'Israel' },

  // Oceania
  SYDNEY_KINGSFORD_SMITH: { name: 'Sydney Kingsford Smith Airport', code: 'SYD', city: 'Sydney', country: 'Australia' },
  MELBOURNE_TULLAMARINE: { name: 'Melbourne Airport', code: 'MEL', city: 'Melbourne', country: 'Australia' },
  AUCKLAND: { name: 'Auckland Airport', code: 'AKL', city: 'Auckland', country: 'New Zealand' },
  BRISBANE: { name: 'Brisbane Airport', code: 'BNE', city: 'Brisbane', country: 'Australia' },
  PERTH: { name: 'Perth Airport', code: 'PER', city: 'Perth', country: 'Australia' },
} satisfies Record<string, AirportInfo>;

export type Airport = keyof typeof AIRPORTS;

// Same data as an array, for dropdowns and loops in templates.
export const AIRPORT_LIST = (Object.keys(AIRPORTS) as Airport[])
  .map((key) => ({ key, ...AIRPORTS[key] }));
