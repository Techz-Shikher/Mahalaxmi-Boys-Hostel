package com.shikher.hotelmanagement;

import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class FoodHistoryActivity extends AppCompatActivity {

    private RecyclerView historyRecyclerView;
    private FirebaseAuth mAuth;
    private FirebaseFirestore db;
    private FoodBookingAdapter adapter;
    private List<FoodBooking> bookingHistory = new ArrayList<>();
    private TextView nextDayMealTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_food_history);

        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();

        historyRecyclerView = findViewById(R.id.foodHistoryRecyclerView);
        nextDayMealTextView = findViewById(R.id.nextDayMealTextView);

        adapter = new FoodBookingAdapter(bookingHistory);
        historyRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        historyRecyclerView.setAdapter(adapter);

        loadFoodHistory();
        loadNextDayMeal();
    }

    private void loadFoodHistory() {
        String userEmail = mAuth.getCurrentUser().getEmail();
        
        db.collection("foodBookings")
                .whereEqualTo("email", userEmail)
                .orderBy("date", com.google.firebase.firestore.Query.Direction.DESCENDING)
                .limit(30)
                .get()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        bookingHistory.clear();
                        for (QueryDocumentSnapshot doc : task.getResult()) {
                            String meal = doc.getString("meal");
                            String date = doc.getString("date");
                            String status = doc.getString("status");
                            
                            if (meal != null && date != null) {
                                bookingHistory.add(new FoodBooking(meal, date, status != null ? status : "confirmed"));
                            }
                        }
                        adapter.notifyDataSetChanged();
                    }
                });
    }

    private void loadNextDayMeal() {
        String userEmail = mAuth.getCurrentUser().getEmail();
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, 1);
        Date tomorrow = calendar.getTime();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        String tomorrowDate = sdf.format(tomorrow);

        db.collection("foodBookings")
                .whereEqualTo("email", userEmail)
                .whereEqualTo("date", tomorrowDate)
                .get()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful() && !task.getResult().isEmpty()) {
                        String meal = task.getResult().getDocuments().get(0).getString("meal");
                        nextDayMealTextView.setText("Tomorrow's Meal: 🍽️ " + (meal != null ? meal : "Not assigned"));
                    } else {
                        nextDayMealTextView.setText("Tomorrow's Meal: ⏳ Pending Assignment");
                    }
                });
    }

    // FoodBooking model class
    public static class FoodBooking {
        public String meal;
        public String date;
        public String status;

        public FoodBooking(String meal, String date, String status) {
            this.meal = meal;
            this.date = date;
            this.status = status;
        }
    }
}
