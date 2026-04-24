package com.mahalaxmi.hostel.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import com.mahalaxmi.hostel.R;
import com.mahalaxmi.hostel.model.EnergyLog;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Locale;

public class EnergyLogAdapter extends ArrayAdapter<EnergyLog> {

    public EnergyLogAdapter(Context context, List<EnergyLog> logs) {
        super(context, 0, logs);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.item_energy_log, parent, false);
        }

        EnergyLog log = getItem(position);

        TextView building = convertView.findViewById(R.id.building_name);
        TextView source = convertView.findViewById(R.id.source);
        TextView consumption = convertView.findViewById(R.id.consumption);
        TextView date = convertView.findViewById(R.id.date);
        TextView type = convertView.findViewById(R.id.type);

        if (log != null) {
            building.setText(log.getBuildingName());
            source.setText("Source: " + log.getSource());
            consumption.setText(String.format("%.1f kWh", log.getEnergyConsumed()));
            
            String typeEmoji = log.getType().equals("electricity") ? "⚡" : 
                              log.getType().equals("gas") ? "🔥" : "💧";
            type.setText(typeEmoji + " " + log.getType());

            SimpleDateFormat sdf = new SimpleDateFormat("MMM dd, yyyy - HH:mm", Locale.getDefault());
            date.setText(sdf.format(log.getLoggedAt().toDate()));
        }

        return convertView;
    }
}
