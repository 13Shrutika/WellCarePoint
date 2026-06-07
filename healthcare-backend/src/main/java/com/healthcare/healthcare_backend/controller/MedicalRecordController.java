package com.healthcare.healthcare_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.healthcare.healthcare_backend.entity.MedicalRecord;
import com.healthcare.healthcare_backend.service.MedicalRecordService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @PostMapping
    public MedicalRecord saveMedicalRecord(@RequestBody MedicalRecord record) {
        return medicalRecordService.saveMedicalRecord(record);
    }

    @GetMapping("/patient/{patientId}")
    public List<MedicalRecord> getRecordsByPatientId(@PathVariable Long patientId) {
        return medicalRecordService.getRecordsByPatientId(patientId);
    }
}
