export class SessionObject {
   constructor( jSess ) {
      this.Id = jSess.Id;
      this.Timestamp = jSess.Timestamp;
      this.Name = jSess.Name;
      this.date = new Date( this.Timestamp );
   }

   compare(other) {
      return other.Timestamp - this.Timestamp;
   }

   dateString() {
      let date = new Date( this.Timestamp );
      return date.toUTCString()
   }
}
