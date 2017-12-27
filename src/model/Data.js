import moment from "moment";

export class SessionObject {
   constructor(jSess) {
      this.Id = jSess.Id;
      this.Timestamp = jSess.Timestamp;
      this.Name = jSess.Name;
      this.date = new Date(this.Timestamp);
   }

   compare(other) {
      return other.Timestamp - this.Timestamp;
   }

   dateString() {
      let offset = moment().utcOffset() * 60 * 1000;
      let date = moment(this.Timestamp - offset);
      return date.fromNow();
   }
}
