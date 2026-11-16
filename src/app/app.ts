import { Component} from '@angular/core';
import { RouterOutlet} from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Notifications } from './components/notifications/notifications';

@Component({
  imports: [RouterOutlet, Header, Footer, Notifications],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  
}
