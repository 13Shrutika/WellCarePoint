package com.healthcare.healthcare_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.healthcare.healthcare_backend.entity.Patient;
import com.healthcare.healthcare_backend.service.PatientService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping
    public Patient savePatient(@RequestBody Patient patient) {
        return patientService.savePatient(patient);
    }

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id) {
        return patientService.getPatientById(id);
    }

    @PostMapping("/register")
    public Patient registerPatient(@RequestBody Patient patient) {
        return patientService.registerPatient(patient);
    }

    @PostMapping("/login")
    public Patient loginPatient(@RequestBody Patient loginRequest) {
        return patientService.loginPatient(loginRequest.getEmail(), loginRequest.getPassword());
    }

    @PutMapping("/{id}/profile")
    public Patient updateProfile(@PathVariable Long id, @RequestBody Patient patientProfile) {
        return patientService.updateProfile(id, patientProfile.getHeight(), patientProfile.getWeight());
    }
}