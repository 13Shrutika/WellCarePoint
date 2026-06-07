package com.healthcare.healthcare_backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthcare.healthcare_backend.entity.MedicalRecord;
import com.healthcare.healthcare_backend.entity.Patient;
import com.healthcare.healthcare_backend.repository.MedicalRecordRepository;

@Service
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PatientService patientService;

    public MedicalRecord saveMedicalRecord(MedicalRecord record) {
        // Automatically sync/update the patient's profile stats
        Patient patient = patientService.getPatientById(record.getPatientId());
        if (patient != null) {
            patient.setHeight(record.getHeight());
            patient.setWeight(record.getWeight());
            patientService.savePatient(patient);
        }
        return medicalRecordRepository.save(record);
    }

    public List<MedicalRecord> getRecordsByPatientId(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId);
    }
}
