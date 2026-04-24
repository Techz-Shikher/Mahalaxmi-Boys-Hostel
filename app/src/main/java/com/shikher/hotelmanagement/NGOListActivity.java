package com.shikher.hotelmanagement;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;

import java.util.ArrayList;
import java.util.List;

public class NGOListActivity extends AppCompatActivity {

    private RecyclerView ngoRecyclerView;
    private NGOAdapter ngoAdapter;
    private List<NGO> ngoList = new ArrayList<>();
    private FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ngo_list);

        db = FirebaseFirestore.getInstance();
        
        ngoRecyclerView = findViewById(R.id.ngoRecyclerView);
        ngoRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        
        ngoAdapter = new NGOAdapter(ngoList, this::callNGO, this::copyPhoneNumber);
        ngoRecyclerView.setAdapter(ngoAdapter);

        loadNGOs();
    }

    private void loadNGOs() {
        db.collection("ngos")
                .get()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        ngoList.clear();
                        for (QueryDocumentSnapshot document : task.getResult()) {
                            NGO ngo = new NGO(
                                    document.getId(),
                                    document.getString("name"),
                                    document.getString("phone"),
                                    document.getString("address"),
                                    document.getString("description"),
                                    document.getString("category")
                            );
                            ngoList.add(ngo);
                        }
                        ngoAdapter.notifyDataSetChanged();
                    } else {
                        Toast.makeText(NGOListActivity.this, 
                                "Error loading NGOs", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void callNGO(String phoneNumber) {
        Intent intent = new Intent(Intent.ACTION_DIAL);
        intent.setData(Uri.parse("tel:" + phoneNumber));
        startActivity(intent);
    }

    private void copyPhoneNumber(String phoneNumber) {
        android.content.ClipboardManager clipboard = 
                (android.content.ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
        android.content.ClipData clip = android.content.ClipData.newPlainText("NGO Phone", phoneNumber);
        clipboard.setPrimaryClip(clip);
        Toast.makeText(this, "Phone number copied!", Toast.LENGTH_SHORT).show();
    }

    public static class NGO {
        public String id;
        public String name;
        public String phone;
        public String address;
        public String description;
        public String category;

        public NGO(String id, String name, String phone, String address, String description, String category) {
            this.id = id;
            this.name = name;
            this.phone = phone;
            this.address = address;
            this.description = description;
            this.category = category;
        }
    }

    public static class NGOAdapter extends RecyclerView.Adapter<NGOAdapter.NGOViewHolder> {

        private List<NGO> ngoList;
        private OnCallClickListener callListener;
        private OnCopyPhoneListener copyListener;

        public interface OnCallClickListener {
            void onCallClick(String phoneNumber);
        }

        public interface OnCopyPhoneListener {
            void onCopyPhone(String phoneNumber);
        }

        public NGOAdapter(List<NGO> ngoList, OnCallClickListener callListener, OnCopyPhoneListener copyListener) {
            this.ngoList = ngoList;
            this.callListener = callListener;
            this.copyListener = copyListener;
        }

        @Override
        public NGOViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
            android.widget.LinearLayout itemView = new android.widget.LinearLayout(parent.getContext());
            itemView.setOrientation(android.widget.LinearLayout.VERTICAL);
            itemView.setLayoutParams(new RecyclerView.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT));
            itemView.setPadding(16, 16, 16, 16);
            itemView.setBackgroundColor(android.graphics.Color.parseColor("#0f172a"));
            
            android.widget.FrameLayout.LayoutParams borderParams = 
                    new android.widget.FrameLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.WRAP_CONTENT);
            borderParams.setMargins(0, 0, 0, 8);
            itemView.setLayoutParams(borderParams);

            return new NGOViewHolder(itemView, callListener, copyListener);
        }

        @Override
        public void onBindViewHolder(NGOViewHolder holder, int position) {
            holder.bind(ngoList.get(position));
        }

        @Override
        public int getItemCount() {
            return ngoList.size();
        }

        public static class NGOViewHolder extends RecyclerView.ViewHolder {

            private android.widget.LinearLayout container;
            private android.widget.TextView nameTV, categoryTV, descriptionTV, addressTV, phoneTV;
            private android.widget.Button callBtn, copyBtn;

            public NGOViewHolder(android.widget.LinearLayout itemView, OnCallClickListener callListener, OnCopyPhoneListener copyListener) {
                super(itemView);

                container = itemView;

                // Create views programmatically
                android.widget.LinearLayout mainLayout = new android.widget.LinearLayout(itemView.getContext());
                mainLayout.setOrientation(android.widget.LinearLayout.VERTICAL);

                // Name
                nameTV = new android.widget.TextView(itemView.getContext());
                nameTV.setTextSize(18);
                nameTV.setTypeface(null, android.graphics.Typeface.BOLD);
                nameTV.setTextColor(android.graphics.Color.WHITE);
                mainLayout.addView(nameTV);

                // Category
                categoryTV = new android.widget.TextView(itemView.getContext());
                categoryTV.setTextSize(12);
                categoryTV.setTextColor(android.graphics.Color.parseColor("#06b6d4"));
                android.widget.LinearLayout.LayoutParams categoryParams = 
                        new android.widget.LinearLayout.LayoutParams(
                                ViewGroup.LayoutParams.WRAP_CONTENT,
                                ViewGroup.LayoutParams.WRAP_CONTENT);
                categoryParams.setMargins(0, 4, 0, 8);
                categoryTV.setLayoutParams(categoryParams);
                mainLayout.addView(categoryTV);

                // Description
                descriptionTV = new android.widget.TextView(itemView.getContext());
                descriptionTV.setTextSize(13);
                descriptionTV.setTextColor(android.graphics.Color.parseColor("#cbd5e1"));
                descriptionTV.setMaxLines(2);
                descriptionTV.setEllipsize(android.text.TextUtils.TruncateAt.END);
                android.widget.LinearLayout.LayoutParams descParams = 
                        new android.widget.LinearLayout.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.WRAP_CONTENT);
                descParams.setMargins(0, 4, 0, 8);
                descriptionTV.setLayoutParams(descParams);
                mainLayout.addView(descriptionTV);

                // Address
                addressTV = new android.widget.TextView(itemView.getContext());
                addressTV.setTextSize(12);
                addressTV.setTextColor(android.graphics.Color.parseColor("#94a3b8"));
                android.widget.LinearLayout.LayoutParams addrParams = 
                        new android.widget.LinearLayout.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.WRAP_CONTENT);
                addrParams.setMargins(0, 4, 0, 8);
                addressTV.setLayoutParams(addrParams);
                mainLayout.addView(addressTV);

                // Phone
                phoneTV = new android.widget.TextView(itemView.getContext());
                phoneTV.setTextSize(12);
                phoneTV.setTextColor(android.graphics.Color.parseColor("#06b6d4"));
                phoneTV.setTypeface(android.graphics.Typeface.MONOSPACE);
                android.widget.LinearLayout.LayoutParams phoneParams = 
                        new android.widget.LinearLayout.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.WRAP_CONTENT);
                phoneParams.setMargins(0, 4, 0, 8);
                phoneTV.setLayoutParams(phoneParams);
                mainLayout.addView(phoneTV);

                // Buttons Layout
                android.widget.LinearLayout buttonsLayout = new android.widget.LinearLayout(itemView.getContext());
                buttonsLayout.setOrientation(android.widget.LinearLayout.HORIZONTAL);
                buttonsLayout.setLayoutParams(new android.widget.LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT));

                // Call Button
                callBtn = new android.widget.Button(itemView.getContext());
                callBtn.setText("📞 Call");
                callBtn.setTextColor(android.graphics.Color.WHITE);
                callBtn.setBackgroundColor(android.graphics.Color.parseColor("#0891b2"));
                android.widget.LinearLayout.LayoutParams callParams = 
                        new android.widget.LinearLayout.LayoutParams(
                                0,
                                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
                                1.0f);
                callParams.setMargins(0, 0, 4, 0);
                callBtn.setLayoutParams(callParams);
                buttonsLayout.addView(callBtn);

                // Copy Button
                copyBtn = new android.widget.Button(itemView.getContext());
                copyBtn.setText("📋 Copy");
                copyBtn.setTextColor(android.graphics.Color.WHITE);
                copyBtn.setBackgroundColor(android.graphics.Color.parseColor("#334155"));
                android.widget.LinearLayout.LayoutParams copyParams = 
                        new android.widget.LinearLayout.LayoutParams(
                                0,
                                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
                                1.0f);
                copyBtn.setLayoutParams(copyParams);
                buttonsLayout.addView(copyBtn);

                mainLayout.addView(buttonsLayout);
                container.addView(mainLayout);

                callBtn.setOnClickListener(v -> {
                    if (callListener != null) {
                        callListener.onCallClick(phoneTV.getText().toString());
                    }
                });

                copyBtn.setOnClickListener(v -> {
                    if (copyListener != null) {
                        copyListener.onCopyPhone(phoneTV.getText().toString());
                    }
                });
            }

            public void bind(NGO ngo) {
                nameTV.setText(ngo.name);
                categoryTV.setText(ngo.category);
                descriptionTV.setText(ngo.description != null ? ngo.description : "No description");
                addressTV.setText("📍 " + ngo.address);
                phoneTV.setText(ngo.phone);
            }
        }
    }
}
