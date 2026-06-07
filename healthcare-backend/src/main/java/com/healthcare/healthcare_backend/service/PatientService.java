package com.healthcare.healthcare_backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthcare.healthcare_backend.entity.Patient;
import com.healthcare.healthcare_backend.repository.PatientRepository;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id).orElse(null);
    }

    public Patient registerPatient(Patient patient) {
        Optional<Patient> existing = patientRepository.findByEmail(patient.getEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Email is already registered!");
        }
        return patientRepository.save(patient);
    }

    public Patient loginPatient(String email, String password) {
        Patient patient = patientRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Patient not found with email: " + email));
        if (!patient.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password!");
        }
        return patient;
    }

    public Patient updateProfile(Long id, double height, double weight) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Patient not found!"));
        patient.setHeight(height);
        patient.setWeight(weight);
        return patientRepository.save(patient);
    }
}