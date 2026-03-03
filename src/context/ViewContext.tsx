import React, { createContext, useContext, useState, useEffect } from "react";

type ViewType = "RETAIL" | "WHOLESALE";

interface ViewContextType {
    view: ViewType;
    setView: (view: ViewType) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [view, setView] = useState<ViewType>(() => {
        const saved = localStorage.getItem("dashboard_view");
        return (saved as ViewType) || "RETAIL";
    });

    useEffect(() => {
        localStorage.setItem("dashboard_view", view);
    }, [view]);

    return (
        <ViewContext.Provider value={{ view, setView }}>
            {children}
        </ViewContext.Provider>
    );
};

export const useView = () => {
    const context = useContext(ViewContext);
    if (context === undefined) {
        throw new Error("useView must be used within a ViewProvider");
    }
    return context;
};
