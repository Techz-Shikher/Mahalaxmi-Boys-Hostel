package com.shikher.hotelmanagement;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;

import java.util.HashMap;
import java.util.Map;
import java.util.Date;

public class ComplaintActivity extends AppCompatActivity {

    private EditText titleInput, descriptionInput;
    private Button submitBtn;
    private FirebaseAuth mAuth;
    private FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_complaint);

        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();

        titleInput = findViewById(R.id.titleInput);
        descriptionInput = findViewById(R.id.descriptionInput);
        submitBtn = findViewById(R.id.submitBtn);

        submitBtn.setOnClickListener(v -> submitComplaint());
    }

    private void submitComplaint() {
        String title = titleInput.getText().toString().trim();
        String description = descriptionInput.getText().toString().trim();

        if (title.isEmpty() || description.isEmpty()) {
            Toast.makeText(this, "Fill all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        Map<String, Object> complaint = new HashMap<>();
        complaint.put("title", title);
        complaint.put("description", description);
        complaint.put("email", mAuth.getCurrentUser().getEmail());
        complaint.put("timestamp", new Date());
        complaint.put("status", "pending");

        db.collection("complaints")
                .add(complaint)
                .addOnSuccessListener(ref -> {
                    Toast.makeText(ComplaintActivity.this, "Complaint submitted!", Toast.LENGTH_SHORT).show();
                    titleInput.setText("");
                    descriptionInput.setText("");
                    finish();
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(ComplaintActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
    }
}
