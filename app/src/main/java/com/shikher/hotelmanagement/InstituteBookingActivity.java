package com.shikher.hotelmanagement;

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class InstituteBookingActivity extends AppCompatActivity {

    private Spinner universitySpinner;
    private Button bookBtn;
    private TextView bookingDateLabel;
    private FirebaseAuth mAuth;
    private FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_institute_booking);

        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();

        universitySpinner = findViewById(R.id.universitySpinner);
        bookBtn = findViewById(R.id.bookBtn);
        bookingDateLabel = findViewById(R.id.bookingDateLabel);

        // Setup date label for next day
        Calendar tomorrow = Calendar.getInstance();
        tomorrow.add(Calendar.DAY_OF_YEAR, 1);
        SimpleDateFormat dateFormat = new SimpleDateFormat("MMM dd, yyyy (EEEE)", Locale.getDefault());
        bookingDateLabel.setText("Booking for: " + dateFormat.format(tomorrow.getTime()));

        // Setup university spinner
        String[] universities = {"Galgotias University", "GCET", "United", "NIET", "Innovative", "lloyd", "G.L Bajaj", "DTC", "IIMT", "KCC"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, universities);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        universitySpinner.setAdapter(adapter);

        bookBtn.setOnClickListener(v -> bookInstituteMeal());
    }

    private void bookInstituteMeal() {
        String university = universitySpinner.getSelectedItem().toString().trim();
        String mealType = "Lunch";

        if (university.isEmpty()) {
            Toast.makeText(this, "Please select your university/institute", Toast.LENGTH_SHORT).show();
            return;
        }

        Calendar tomorrow = Calendar.getInstance();
        tomorrow.add(Calendar.DAY_OF_YEAR, 1);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        String bookingDate = dateFormat.format(tomorrow.getTime());

        Map<String, Object> booking = new HashMap<>();
        booking.put("userId", mAuth.getCurrentUser().getUid());
        booking.put("email", mAuth.getCurrentUser().getEmail());
        booking.put("studentName", mAuth.getCurrentUser().getDisplayName() != null ? mAuth.getCurrentUser().getDisplayName() : "Unknown");
        booking.put("university", university);
        booking.put("mealType", mealType);
        booking.put("date", bookingDate);
        booking.put("status", "confirmed");
        booking.put("bookedAt", new Date());

        db.collection("instituteBookings")
                .add(booking)
                .addOnSuccessListener(ref -> {
                    Toast.makeText(InstituteBookingActivity.this,
                            "Institute lunch booked for " + university + " tomorrow!", Toast.LENGTH_SHORT).show();
                    finish();
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(InstituteBookingActivity.this,
                            "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
    }
}
