import { AudioWaveform, ToggleLeft, ToggleRight } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

interface EQHeaderProps {
  bypassed: boolean;
  onBypassChange: (bypassed: boolean) => void;
}

const EQHeader: React.FC<EQHeaderProps> = ({ bypassed, onBypassChange }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AudioWaveform className="h-5 w-5" />
        <h2 className="text-xl font-medium">Equalizer</h2>
      </div>
      <Toggle 
        pressed={!bypassed}
        onPressedChange={(pressed) => onBypassChange(!pressed)}
        className={`transition-opacity ${bypassed ? 'opacity-50' : ''}`}
      >
        {bypassed ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
        {bypassed ? 'Bypassed' : 'Active'}
      </Toggle>
    </div>
  );
};

export default EQHeader;