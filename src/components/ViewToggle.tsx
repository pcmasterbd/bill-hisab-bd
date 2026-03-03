import { Store, Factory } from "lucide-react";

interface ViewToggleProps {
    view: "RETAIL" | "WHOLESALE";
    onViewChange: (view: "RETAIL" | "WHOLESALE") => void;
}

const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
    return (
        <div className="flex p-1 bg-[#0f172a]/80 backdrop-blur-sm rounded-xl border border-white/5 w-full">
            <button
                onClick={() => onViewChange("RETAIL")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${view === "RETAIL"
                    ? "bg-[#0052FF] text-white shadow-[0_0_15px_rgba(0,82,255,0.4)]"
                    : "text-[#94a3b8] hover:text-white hover:bg-white/5"
                    }`}
            >
                <span className="text-sm">🏪</span>
                Retail
            </button>
            <button
                onClick={() => onViewChange("WHOLESALE")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${view === "WHOLESALE"
                    ? "bg-[#0052FF] text-white shadow-[0_0_15px_rgba(0,82,255,0.4)]"
                    : "text-[#94a3b8] hover:text-white hover:bg-white/5"
                    }`}
            >
                <span className="text-sm">🏭</span>
                Wholesale
            </button>
        </div>
    );
};

export default ViewToggle;
