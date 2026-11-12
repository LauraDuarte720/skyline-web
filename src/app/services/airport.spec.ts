import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AirportService } from './airport';
import { Airport } from '../flights/airport';

describe('AirportService', () => {
  const URL = 'http://localhost:8080/api/airports';
  const EL_DORADO: Airport = { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' };
  const EL_EDEN: Airport = { code: 'AXM', name: 'El Edén International Airport', city: 'Armenia', country: 'Colombia' };

  let service: AirportService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AirportService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should load the airports from the backend', () => {
    let result: Airport[] = [];

    service.getAirports().subscribe((airports) => (result = airports));
    http.expectOne(URL).flush([EL_DORADO, EL_EDEN]);

    expect(result).toEqual([EL_DORADO, EL_EDEN]);
  });

  it('should request the catalog only once', () => {
    service.getAirports().subscribe();
    service.getAirports().subscribe();
    service.getAirportsByCode().subscribe();

    http.expectOne(URL).flush([EL_DORADO]);   // fails if there is more than one request
  });

  it('should find an airport by its IATA code', () => {
    let byCode = new Map<string, Airport>();

    service.getAirportsByCode().subscribe((map) => (byCode = map));
    http.expectOne(URL).flush([EL_DORADO, EL_EDEN]);

    expect(byCode.get('AXM')).toEqual(EL_EDEN);
  });
});
