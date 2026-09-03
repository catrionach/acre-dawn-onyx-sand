import type { ParsedLookup } from "./build-lookup";

/** Default Build Component Lookup (the shop matrix). Seeded when the tables are empty. */
export const LOOKUP_SEED: ParsedLookup = {
  "components": [
    {
      "key": "RBCONTROLPCBNO10018-02",
      "label": "RB Control PCB No 10018-02",
      "kind": "pcb",
      "position": 1
    },
    {
      "key": "ABRECEIVERPCBNO10038-02",
      "label": "AB Receiver PCB No 10038-02",
      "kind": "pcb",
      "position": 2
    },
    {
      "key": "MULTI-USEPCB10039-02",
      "label": "Multi-Use PCB 10039-02",
      "kind": "pcb",
      "position": 3
    },
    {
      "key": "ASSY.VLFLOOP.RX",
      "label": "ASSY.VLFLOOP.RX",
      "kind": "subassembly",
      "position": 4
    },
    {
      "key": "ASSY.VLFLOOP.TX",
      "label": "ASSY.VLFLOOP.TX",
      "kind": "subassembly",
      "position": 5
    },
    {
      "key": "TRANSMITTERNO10027-02",
      "label": "Transmitter No 10027-02",
      "kind": "subassembly",
      "position": 6
    },
    {
      "key": "ASSY.ANT1(A)",
      "label": "ASSY.ANT1 (A)",
      "kind": "subassembly",
      "position": 7
    },
    {
      "key": "ASSY.ANT1(B)",
      "label": "ASSY.ANT1 (B)",
      "kind": "subassembly",
      "position": 8
    },
    {
      "key": "ASSY.ANT2.(A)",
      "label": "ASSY.ANT2. (A)",
      "kind": "subassembly",
      "position": 9
    },
    {
      "key": "ASSY.ANT2.(B)",
      "label": "ASSY.ANT2. (B)",
      "kind": "subassembly",
      "position": 10
    },
    {
      "key": "ASSY.ANT16(A)",
      "label": "ASSY.ANT16 (A)",
      "kind": "subassembly",
      "position": 11
    },
    {
      "key": "ASSY.ANT.16(B)",
      "label": "ASSY.ANT.16 (B)",
      "kind": "subassembly",
      "position": 12
    },
    {
      "key": "COIL_PCB_10012-02-B",
      "label": "COIL_PCB_10012-02-B",
      "kind": "pcb",
      "position": 13
    },
    {
      "key": "LORAWANPCB10158-02",
      "label": "LoRaWAN PCB 10158-02",
      "kind": "pcb",
      "position": 14
    }
  ],
  "batteries": [
    "BE.D2",
    "BE.D4",
    "BP.7.2V.NiMH",
    "BE.D2.C1",
    "N/A"
  ],
  "map": {
    "ASSY.ANT1": [],
    "ASSY.ANT2": [],
    "ASSY.VLFLOOP": [
      "COIL_PCB_10012-02-B"
    ],
    "DRBPB-L-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)",
      "ASSY.ANT1(B)",
      "LORAWANPCB10158-02"
    ],
    "DRBPB-S-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)",
      "ASSY.ANT1(B)"
    ],
    "DRBXC200-L-B": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT16(A)",
      "ASSY.ANT.16(B)",
      "LORAWANPCB10158-02"
    ],
    "DRBXC200-N-B": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT16(A)",
      "ASSY.ANT.16(B)"
    ],
    "DRBXC200-N-B-SOLAR": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT16(A)",
      "ASSY.ANT.16(B)"
    ],
    "DRBXC200-S-B": [
      "RBCONTROLPCBNO10018-02",
      "MULTI-USEPCB10039-02",
      "ASSY.ANT16(A)",
      "ASSY.ANT.16(B)"
    ],
    "DRBX-D-B": [
      "RBCONTROLPCBNO10018-02",
      "MULTI-USEPCB10039-02",
      "ASSY.ANT1(A)",
      "ASSY.ANT1(B)"
    ],
    "DRBX-D-PH": [
      "RBCONTROLPCBNO10018-02",
      "MULTI-USEPCB10039-02",
      "ASSY.ANT1(A)",
      "ASSY.ANT1(B)"
    ],
    "DRBX-L-B": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT1(A)",
      "ASSY.ANT1(B)",
      "LORAWANPCB10158-02"
    ],
    "DRBX-L-Bespoke 1": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT2.(A)",
      "ASSY.ANT2.(B)",
      "LORAWANPCB10158-02"
    ],
    "DRBX-L-Bespoke 2": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT2.(A)",
      "ASSY.ANT2.(B)",
      "LORAWANPCB10158-02"
    ],
    "DRBX-L-PH": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT1(A)",
      "ASSY.ANT1(B)",
      "LORAWANPCB10158-02"
    ],
    "DRBX-N-B": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT1(A)",
      "ASSY.ANT1(B)"
    ],
    "DRBX-S-B": [
      "RBCONTROLPCBNO10018-02",
      "MULTI-USEPCB10039-02",
      "ASSY.ANT1(A)",
      "ASSY.ANT1(B)"
    ],
    "DRBX-S-PH": [
      "RBCONTROLPCBNO10018-02",
      "MULTI-USEPCB10039-02",
      "ASSY.ANT1(A)",
      "ASSY.ANT1(B)"
    ],
    "DRBX-S-PH-INT": [],
    "MIRB-D": [],
    "MIRB-L Standard": [
      "LORAWANPCB10158-02"
    ],
    "MIRB-L-Side": [
      "LORAWANPCB10158-02"
    ],
    "MIRB-N Standard": [],
    "MIRB-N-Side": [],
    "RBC-D-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBC-D-PH": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBC-L-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)",
      "LORAWANPCB10158-02"
    ],
    "RBC-L-PH": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)",
      "LORAWANPCB10158-02"
    ],
    "RBC-N-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBC-N-PH": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBC-S-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBC-S-PH": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBPB-D-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBPB-D-PH": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBPB-L-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)",
      "LORAWANPCB10158-02"
    ],
    "RBPB-L-PH": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)",
      "LORAWANPCB10158-02"
    ],
    "RBPB-N-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBPB-N-PH": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBPB-S-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBPB-S-PH": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBTriple-D-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBTriple-D-PH": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBTriple-L-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)",
      "LORAWANPCB10158-02"
    ],
    "RBTriple-L-PH": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)",
      "LORAWANPCB10158-02"
    ],
    "RBTriple-S-B": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBTriple-S-PH": [
      "RBCONTROLPCBNO10018-02",
      "ABRECEIVERPCBNO10038-02",
      "MULTI-USEPCB10039-02",
      "ASSY.VLFLOOP.RX",
      "ASSY.ANT1(A)"
    ],
    "RBX-D-B": [
      "RBCONTROLPCBNO10018-02",
      "MULTI-USEPCB10039-02",
      "ASSY.ANT1(A)"
    ],
    "RBX-D-MPP": [
      "RBCONTROLPCBNO10018-02",
      "MULTI-USEPCB10039-02",
      "ASSY.ANT1(A)"
    ],
    "RBX-D-PH": [
      "RBCONTROLPCBNO10018-02",
      "MULTI-USEPCB10039-02",
      "ASSY.ANT1(A)"
    ],
    "RBX-D-PH-INT": [
      "MULTI-USEPCB10039-02"
    ],
    "RBX-L-B": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT1(A)",
      "LORAWANPCB10158-02"
    ],
    "RBX-L-PH": [
      "LORAWANPCB10158-02"
    ],
    "RBX-N-B": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT1(A)"
    ],
    "RBX-N-Bespoke 1": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT1(A)"
    ],
    "RBX-N-PH": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT1(A)"
    ],
    "RBX-N-PH-FRONT": [
      "RBCONTROLPCBNO10018-02",
      "ASSY.ANT1(A)"
    ],
    "RBX-S-B": [
      "RBCONTROLPCBNO10018-02",
      "MULTI-USEPCB10039-02",
      "ASSY.ANT1(A)"
    ],
    "RBX-S-PH": [
      "RBCONTROLPCBNO10018-02",
      "MULTI-USEPCB10039-02",
      "ASSY.ANT1(A)"
    ],
    "TX100": [
      "TRANSMITTERNO10027-02"
    ],
    "TX200": [],
    "TX300": [
      "ASSY.VLFLOOP.TX",
      "TRANSMITTERNO10027-02"
    ]
  }
};
