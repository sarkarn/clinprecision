import React from "react";
import { Route } from "react-router-dom";
import DataCaptureModule from "../../../../clinprecision/src/components/modules/datacapture/DataCaptureModule";

const DataCaptureRoutes = () => (
    <>
        <Route path="/datacapture-management/*" element={<DataCaptureModule />} />
        {/* Add more data capture related routes here */}
    </>
);

export default DataCaptureRoutes;
