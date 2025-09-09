import React from "react";

function MetadataDisplay({tipo, metadata}) {
    if (!metadata || !metadata.valore) {
        return null;
    }

    if (metadata.tipo.toUpperCase() !== tipo.toUpperCase()) {
        return null;
    }

    console.log("Rendering MetadataDisplay", tipo, metadata);

    if (tipo.toLowerCase() === "colore") {
        return <span
            style={{
                backgroundColor: metadata.valore,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '8px',
                border: '1px solid ' + metadata.valore,
                boxShadow: '0 0 3px rgba(0,0,0,0.3)'
            }}
        ></span>
    }

    return (
        <span>
      {metadata.valore}
    </span>
    );
}

export default MetadataDisplay;