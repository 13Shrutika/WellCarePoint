package com.healthcare.healthcare_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthcare.healthcare_backend.entity.Appointment;
import com.healthcare.healthcare_backend.repository.AppointmentRepository;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public Appointment saveAppointment(Appointment appointment) {
        // Validate slot availability
        List<Appointment> existing = appointmentRepository.findByDoctorIdAndAppointmentDate(
            appointment.getDoctorId(), appointment.getAppointmentDate()
        );
        boolean isSlotTaken = existing.stream().anyMatch(app -> 
            app.getTimeSlot().equalsIgnoreCase(appointment.getTimeSlot()) && 
            !app.getStatus().equalsIgnoreCase("REJECTED") &&
            !app.getStatus().equalsIgnoreCase("CANCELLED")
        );
        if (isSlotTaken) {
            throw new RuntimeException("This time slot is already booked for the selected doctor and date!");
        }
        
        if (appointment.getStatus() == null) {
            appointment.setStatus("PENDING");
        }
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<String> getBookedSlotsForDoctor(Long doctorId, String date) {
        List<Appointment> list = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
        return list.stream()
            .filter(app -> !app.getStatus().equalsIgnoreCase("REJECTED")
                       && !app.getStatus().equalsIgnoreCase("CANCELLED"))
            .map(Appointment::getTimeSlot)
            .collect(Collectors.toList());
    }

    public Appointment updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found!"));
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    public Appointment cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found!"));
        String currentStatus = appointment.getStatus();
        if (currentStatus.equalsIgnoreCase("COMPLETED")) {
            throw new RuntimeException("Cannot cancel a completed appointment.");
        }
        if (currentStatus.equalsIgnoreCase("CANCELLED")) {
            throw new RuntimeException("Appointment is already cancelled.");
        }
        appointment.setStatus("CANCELLED");
        return appointmentRepository.save(appointment);
    }
}