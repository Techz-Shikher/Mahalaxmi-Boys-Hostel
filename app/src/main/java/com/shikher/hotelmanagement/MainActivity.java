package com.shikher.hotelmanagement;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.storage.FirebaseStorage;

public class MainActivity extends AppCompatActivity {

    private FirebaseAuth mAuth;
    private FirebaseFirestore db;
    private TextView userEmail, roomStatus;
    private Button logoutBtn, addComplaintBtn, viewAnnouncementsBtn, viewFoodHistoryBtn, viewMenuBtn;
    private CardView foodBookingCard, transportCard, foodHistoryCard, menuCard, instituteBookingCard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();

        userEmail = findViewById(R.id.userEmail);
        roomStatus = findViewById(R.id.roomStatus);
        logoutBtn = findViewById(R.id.logoutBtn);
        addComplaintBtn = findViewById(R.id.addComplaintBtn);
        viewAnnouncementsBtn = findViewById(R.id.viewAnnouncementsBtn);
        foodBookingCard = findViewById(R.id.foodBookingCard);
        transportCard = findViewById(R.id.transportCard);
        foodHistoryCard = findViewById(R.id.foodHistoryCard);
        viewFoodHistoryBtn = findViewById(R.id.viewFoodHistoryBtn);
        menuCard = findViewById(R.id.menuCard);
        viewMenuBtn = findViewById(R.id.viewMenuBtn);
        instituteBookingCard = findViewById(R.id.instituteBookingCard);

        // Set user email
        if (mAuth.getCurrentUser() != null) {
            userEmail.setText("Welcome, " + mAuth.getCurrentUser().getEmail());
            loadUserRoom();
        }

        // Logout button
        logoutBtn.setOnClickListener(v -> {
            mAuth.signOut();
            startActivity(new Intent(MainActivity.this, LoginActivity.class));
            finish();
        });

        // Add complaint button
        addComplaintBtn.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, ComplaintActivity.class));
        });

        // View announcements button
        viewAnnouncementsBtn.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, AnnouncementsActivity.class));
        });

        // Food Booking card
        foodBookingCard.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, FoodBookingActivity.class));
        });

        // Transport card
        transportCard.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, TransportActivity.class));
        });

        // Food History card
        foodHistoryCard.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, FoodHistoryActivity.class));
        });

        // Food History button
        viewFoodHistoryBtn.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, FoodHistoryActivity.class));
        });

        // Menu card
        menuCard.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, MenuActivity.class));
        });

        // Menu button
        viewMenuBtn.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, MenuActivity.class));
        });

        // Institute Booking card
        instituteBookingCard.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, InstituteBookingActivity.class));
        });
    }

    private void loadUserRoom() {
        String userEmail = mAuth.getCurrentUser().getEmail();
        db.collection("users")
                .whereEqualTo("email", userEmail)
                .get()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        QuerySnapshot snapshot = task.getResult();
                        if (!snapshot.isEmpty()) {
                            String roomId = snapshot.getDocuments().get(0).getString("roomId");
                            if (roomId != null) {
                                loadRoomDetails(roomId);
                            } else {
                                roomStatus.setText("No room assigned");
                            }
                        }
                    }
                });
    }

    private void loadRoomDetails(String roomId) {
        db.collection("rooms").document(roomId)
                .get()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        String roomNumber = task.getResult().getString("roomNumber");
                        Long occupancy = task.getResult().getLong("capacity");
                        roomStatus.setText("Room: " + roomNumber + " | Capacity: " + occupancy);
                    }
                });
    }
}
