let itemVars = {
    weapons:{
        stick:{
            weapon:true,
            name:"stick",
            damage:1,
            stunTime:1,
            weight:1,
            type:{
                blunt:true
            }
        },
        club:{
            weapon:true,
            name:"club",
            damage:2,
            stunTime:2,
            weight:1,
            type:{
                blunt:true
            },
            swing:{
                damage:5,
                stunTime:4,
                weight:1,
            }
        },
        mace:{
            weapon:true,
            name:"mace",
            damage:5,
            stunTime:4,
            weight:1,
            type:{
                blunt:true
            },
            swing:{
                damage:1,
                stunTime:1,
                weight:1,
            }
        },
        shortsword:{
            weapon:true,
            name:"shortsword",
            damage:3,
            stunTime:2,
            weight:1,
            type:{
                sword:true,
                edged:true
            }
        },
        longsword:{
            weapon:true,
            name:"longsword",
            damage:8,
            stunTime:3,
            weight:2,
            type:{
                sword:true,
                edged:true
            }
        },
        greatsword:{
            weapon:true,
            name:"greatsword",
            damage:12,
            stunTime:4,
            weight:3,
            type:{
                sword:true,
                edged:true
            }
        },
    },
    fuel:{
        oilFlask:{
            usable:true,
            name: "oil flask",
            fuel:true,
            light:2,
            uses:3
        }
    },
    loot:{
        vase:{
            value:5
        },
        pendant:{
            value:10
        }
    }
}

/*
case "stick":
                sword.damage = 1;
                sword.stunTime = 1;
                sword.weight = 1;
                break;
            case "shortsword":
                sword.damage = 3;
                sword.stunTime = 2;
                sword.weight = 1;
                break;
            case "longsword":
                sword.damage = 4;
                sword.stunTime = 3;
                sword.weight = 2;
                break;
            case "rapier":
                sword.damage = 5;
                sword.stunTime = 2;
                sword.weight = 0;
                break;
            case "greatsword":
                sword.damage = 4;
                sword.stunTime = 6;
                sword.weight = 3;
                break;
            case "club":
                sword.damage = 1;
                sword.stunTime = 6;
                sword.weight = 2;
                break;
            case "maul":
                sword.damage = 3;
                sword.stunTime = 8;
                sword.weight = 3;
                break;
        }*/