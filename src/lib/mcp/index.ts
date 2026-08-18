import { defineMcp } from "@lovable.dev/mcp-js";
import bookAppointment from "./tools/book_appointment";
import getDoctorQueue from "./tools/get_doctor_queue";
import getHospitalStats from "./tools/get_hospital_stats";
import listDepartments from "./tools/list_departments";
import listDoctors from "./tools/list_doctors";
import listEmergencies from "./tools/list_emergencies";
import predictWaitingTime from "./tools/predict_waiting_time";

export default defineMcp({
  name: "remix-of-event-registration-page-template",
  title: "Remix of Event Registration Page Template",
  version: "0.1.0",
  instructions:
    "Tools for the AI-Based Smart Hospital Management System demo. Use these to query hospital departments, doctors, live queues, emergency cases, and hospital stats, or to book appointments and get AI waiting-time predictions. All data is synthetic demo data for the Smart India Hackathon project.",
  tools: [
    listDepartments,
    listDoctors,
    getHospitalStats,
    listEmergencies,
    getDoctorQueue,
    predictWaitingTime,
    bookAppointment,
  ],
});
