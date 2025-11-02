import React from "react";
import { Route } from "react-router-dom";
import DataCaptureModule from "@domains/clinops/src/ui/DataCaptureModule";

export const DataCaptureRoutes = () => (
    <React.Fragment>
        <Route path="/datacapture-management/*" element={<DataCaptureModule />} />
        {/* Add more data capture related routes here */}
    </React.Fragment>
);
