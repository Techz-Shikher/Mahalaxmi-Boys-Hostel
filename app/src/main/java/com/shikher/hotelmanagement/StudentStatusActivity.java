package com.shikher.hotelmanagement;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;

import java.util.HashMap;
import java.util.Map;

public class StudentStatusActivity extends AppCompatActivity {

    private FirebaseAuth mAuth;
    private FirebaseFirestore db;
    private Button inHostelBtn, atHomeBtn;
    private TextView statusLabel;
    private String currentStatus = "inHostel";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_student_status);

        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();

        inHostelBtn = findViewById(R.id.inHostelBtn);
        atHomeBtn = findViewById(R.id.atHomeBtn);
        statusLabel = findViewById(R.id.statusLabel);

        // Load current status
        loadCurrentStatus();

        // In Hostel button
        inHostelBtn.setOnClickListener(v -> updateStatus("inHostel"));

        // At Home button
        atHomeBtn.setOnClickListener(v -> updateStatus("atHome"));
    }

    private void loadCurrentStatus() {
        if (mAuth.getCurrentUser() == null) {
            return;
        }

        String userId = mAuth.getCurrentUser().getUid();
        db.collection("studentStatus").document(userId).get()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful() && task.getResult().exists()) {
                        currentStatus = task.getResult().getString("status");
                        if (currentStatus != null) {
                            updateButtonStates();
                        }
                    }
                });
    }

    private void updateStatus(String newStatus) {
        if (mAuth.getCurrentUser() == null) {
            Toast.makeText(this, "Error: User not found", Toast.LENGTH_SHORT).show();
            return;
        }

        String userId = mAuth.getCurrentUser().getUid();
        String userName = mAuth.getCurrentUser().getDisplayName() != null ?
                mAuth.getCurrentUser().getDisplayName() : mAuth.getCurrentUser().getEmail();

        Map<String, Object> statusData = new HashMap<>();
        statusData.put("userId", userId);
        statusData.put("userName", userName);
        statusData.put("status", newStatus);
        statusData.put("timestamp", com.google.firebase.Timestamp.now());

        db.collection("studentStatus").document(userId).set(statusData)
                .addOnSuccessListener(aVoid -> {
                    currentStatus = newStatus;
                    updateButtonStates();
                    Toast.makeText(StudentStatusActivity.this,
                            "Status updated to " + (newStatus.equals("inHostel") ? "In Hostel" : "At Home"),
                            Toast.LENGTH_SHORT).show();
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(StudentStatusActivity.this,
                            "Error updating status: " + e.getMessage(),
                            Toast.LENGTH_SHORT).show();
                });
    }

    private void updateButtonStates() {
        if (currentStatus.equals("inHostel")) {
            inHostelBtn.setBackgroundColor(getResources().getColor(android.R.color.holo_green_dark));
            atHomeBtn.setBackgroundColor(getResources().getColor(android.R.color.darker_gray));
            statusLabel.setText("🏠 Currently: In Hostel");
        } else {
            inHostelBtn.setBackgroundColor(getResources().getColor(android.R.color.darker_gray));
            atHomeBtn.setBackgroundColor(getResources().getColor(android.R.color.holo_blue_dark));
            statusLabel.setText("🏫 Currently: At Home");
        }
    }
}
