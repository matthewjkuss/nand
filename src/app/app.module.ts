import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MapDisplayComponent } from './map-display/map-display.component';
import { ChipDisplayComponent } from './chip-display/chip-display.component';
import { ChipInteriorComponent } from './chip-interior/chip-interior.component';
import { ChipExteriorComponent } from './chip-exterior/chip-exterior.component';

@NgModule({
  declarations: [
    AppComponent,
    MapDisplayComponent,
    ChipDisplayComponent,
    ChipInteriorComponent,
    ChipExteriorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatCheckboxModule,
    MatSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
