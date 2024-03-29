// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  API_URL: 'https://qa-strapitoheroku-7th9x.ondigitalocean.app',
  mapbox: {
    accessToken: 'pk.eyJ1IjoibWljaGFlbHN0b2tlczkzIiwiYSI6ImNrb3Vjdml5MzA1bmIyd3BmMWp6ajIzZjAifQ.pN69oXSyuv632xMknLYQpw'
  },
  coordinates: {
    lat: 52.205338,
    lng: 0.121817
  },
  google: {
    maps: {
      url: 'https://www.google.com/maps/dir/?api=1&travelmode=driving&'
    },
    apikey: "AIzaSyC0v5AjZusQowqnyKMlIeZbtbqsEN0ig20"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
