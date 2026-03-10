package com.mycompany.plugins.example;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import android.util.DisplayMetrics;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DevicePpi")
public class DevicePpiPlugin extends Plugin {

    private DevicePpi implementation = new DevicePpi();

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", implementation.echo(value));
        call.resolve(ret);
    }

    @PluginMethod
    public void getPPI(PluginCall call) {
        try {
            DisplayMetrics metrics = getContext().getResources().getDisplayMetrics();
            JSObject ret = new JSObject();
            ret.put("xdpi", metrics.xdpi);
            ret.put("ydpi", metrics.ydpi);

            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error retrieving PPI: " + e.getMessage());
        }
    }
}
