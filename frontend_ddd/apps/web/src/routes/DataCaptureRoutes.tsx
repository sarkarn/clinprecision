import React from "react";
import { Route } from "react-router-dom";
import DataCaptureModule from "@domains/clinops/src/ui/DataCaptureModule";

const DataCaptureRoutes = () => (
    <>
        <Route path="/datacapture-management/*" element={<DataCaptureModule />} />
        {/* Add more data capture related routes here */}
    </>
);

export default DataCaptureRoutes;
