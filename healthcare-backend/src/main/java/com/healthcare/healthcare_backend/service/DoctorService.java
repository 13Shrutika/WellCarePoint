package com.healthcare.healthcare_backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthcare.healthcare_backend.entity.Doctor;
import com.healthcare.healthcare_backend.repository.DoctorRepository;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id).orElse(null);
    }

    public Doctor registerDoctor(Doctor doctor) {
        Optional<Doctor> existing = doctorRepository.findByEmail(doctor.getEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Email is already registered!");
        }
        return doctorRepository.save(doctor);
    }

    public Doctor loginDoctor(String email, String password) {
        Doctor doctor = doctorRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Doctor not found with email: " + email));
        if (!doctor.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password!");
        }
        return doctor;
    }
}