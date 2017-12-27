import { API_ROOT } from "./api-config";
import request from "superagent";

function getURI(pathAndQuery) {
   return request.get(`${API_ROOT}` + pathAndQuery);
}

export function getBoards(sessionId) {
   return getURI("boards/?sessionId=" + sessionId);
}

export function getSessions() {
   return getURI("sessions/");
}
