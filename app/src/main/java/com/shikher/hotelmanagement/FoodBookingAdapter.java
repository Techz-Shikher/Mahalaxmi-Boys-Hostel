package com.shikher.hotelmanagement;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class FoodBookingAdapter extends RecyclerView.Adapter<FoodBookingAdapter.ViewHolder> {

    private List<FoodHistoryActivity.FoodBooking> bookings;

    public FoodBookingAdapter(List<FoodHistoryActivity.FoodBooking> bookings) {
        this.bookings = bookings;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_food_booking, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        FoodHistoryActivity.FoodBooking booking = bookings.get(position);
        
        // Set meal emoji based on type
        String mealEmoji = getMealEmoji(booking.meal);
        holder.mealTextView.setText(mealEmoji + " " + booking.meal);
        holder.dateTextView.setText("📅 " + booking.date);
        
        // Status color
        if ("confirmed".equals(booking.status)) {
            holder.statusTextView.setText("✓ Confirmed");
            holder.statusTextView.setTextColor(0xFF4ade80); // Green
        } else if ("pending".equals(booking.status)) {
            holder.statusTextView.setText("⏳ Pending");
            holder.statusTextView.setTextColor(0xFFfbbf24); // Amber
        } else {
            holder.statusTextView.setText("✗ Cancelled");
            holder.statusTextView.setTextColor(0xFFef4444); // Red
        }
    }

    @Override
    public int getItemCount() {
        return bookings.size();
    }

    private String getMealEmoji(String meal) {
        if (meal == null) return "🍽️";
        switch (meal.toLowerCase()) {
            case "breakfast":
                return "🥐";
            case "lunch":
                return "🍛";
            case "dinner":
                return "🍖";
            case "snacks":
                return "🍪";
            default:
                return "🍽️";
        }
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView mealTextView, dateTextView, statusTextView;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            mealTextView = itemView.findViewById(R.id.mealTextView);
            dateTextView = itemView.findViewById(R.id.dateTextView);
            statusTextView = itemView.findViewById(R.id.statusTextView);
        }
    }
}
