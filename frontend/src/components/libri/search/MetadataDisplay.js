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
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '8px',
                border: '1px solid ' + metadata.valore
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