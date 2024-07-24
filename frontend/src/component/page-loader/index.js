import React, { useState } from "react";
import Spinner from "../../assets/loading.gif";

const PageLoader = () => {
    const [loading, setLoading] = useState(false);
    return [
        loading ? (<div className="fp-container"><img src={Spinner} className="fp-loader" alt="loading" /></div>) : null,
        () => setLoading(true),
        () => setLoading(false)
    ];
};

export default PageLoader;