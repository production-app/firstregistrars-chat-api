const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return T_shold.init(sequelize, DataTypes);
}

class T_shold extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    Acctno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    regcode: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    agent: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    last_nm: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    first_nm: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    middle_nm: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    sex: {
      type: DataTypes.STRING(1),
      allowNull: false
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: true
    },
    addr1: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    addr2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    addr3: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    st: {
      type: DataTypes.CHAR(3),
      allowNull: false
    },
    orig_st: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    typer: {
      type: DataTypes.STRING(1),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    fax: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    offer_no: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sbrok: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    who: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    narr: {
      type: DataTypes.CHAR(16),
      allowNull: true
    },
    oldaccountno: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    chn: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    maiden: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mand_acct: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    status1: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    keep: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    narration1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    chn_acct: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    nextofkin: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    deceased: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    consolid_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    occupation_code: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    extract_bonus: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    caution_ref: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    fbn_code: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bighold_branch: {
      type: DataTypes.CHAR(6),
      allowNull: true
    },
    reinvest: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    e_account_no: {
      type: DataTypes.CHAR(40),
      allowNull: true
    },
    auto1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    state_code: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    post_office_code: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    address_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    auto: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    chn_member: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    gsm_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    gsm_subs_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    gsm_subs_warn: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    nibbs_verif: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    gsm_subs_life: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gsm_subs_warn2: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    gsm_subs_warn3: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    e_repo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    div_loc: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    div_conv_cert: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    divcard: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    divcard_ed: {
      type: DataTypes.DATE,
      allowNull: true
    },
    bvn: {
      type: DataTypes.STRING(12),
      allowNull: true
    },
    hld_type_Verif: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    lga: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    creatdates: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('getdate')
    },
    ctry_code: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    nlity: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    nin: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tin: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    mob2: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    nok_mob: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    gotcha_lnk: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'T_shold',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "_dta_index_T_shold_10_453576654__K2_K1_K5_K6_K7",
        fields: [
          { name: "regcode" },
          { name: "Acctno" },
          { name: "last_nm" },
          { name: "first_nm" },
          { name: "middle_nm" },
        ]
      },
      {
        name: "_dta_index_T_shold_20_453576654__K1_K2_K5_K6_K7_K30",
        fields: [
          { name: "Acctno" },
          { name: "regcode" },
          { name: "last_nm" },
          { name: "first_nm" },
          { name: "middle_nm" },
          { name: "status" },
        ]
      },
      {
        name: "_dta_index_T_shold_9_453576654__K19",
        fields: [
          { name: "mobile" },
        ]
      },
      {
        name: "fr_card",
        fields: [
          { name: "mobile" },
          { name: "divcard_ed" },
        ]
      },
      {
        name: "IX_gotsha1",
        fields: [
          { name: "gotcha_lnk" },
        ]
      },
      {
        name: "IX_shareholder_17",
        fields: [
          { name: "Acctno" },
          { name: "regcode" },
          { name: "bvn" },
        ]
      },
      {
        name: "IX_T_shareholder",
        fields: [
          { name: "regcode" },
          { name: "last_nm" },
          { name: "first_nm" },
          { name: "middle_nm" },
        ]
      },
      {
        name: "IX_T_shareholder_1",
        unique: true,
        fields: [
          { name: "regcode" },
          { name: "Acctno" },
        ]
      },
      {
        name: "IX_T_shareholder_10",
        fields: [
          { name: "regcode" },
          { name: "consolid_id" },
        ]
      },
      {
        name: "IX_T_shareholder_11",
        fields: [
          { name: "regcode" },
          { name: "chn_acct" },
        ]
      },
      {
        name: "IX_T_shareholder_12",
        fields: [
          { name: "auto" },
        ]
      },
      {
        name: "IX_T_Shareholder_13",
        fields: [
          { name: "regcode" },
          { name: "gsm_subs_dt" },
        ]
      },
      {
        name: "IX_T_shareholder_2",
        fields: [
          { name: "regcode" },
          { name: "addr1" },
          { name: "addr2" },
          { name: "addr3" },
        ]
      },
      {
        name: "IX_T_shareholder_3",
        fields: [
          { name: "regcode" },
          { name: "st" },
        ]
      },
      {
        name: "IX_T_shareholder_4",
        fields: [
          { name: "regcode" },
          { name: "occupation_code" },
        ]
      },
      {
        name: "IX_T_shareholder_5",
        fields: [
          { name: "regcode" },
          { name: "oldaccountno" },
        ]
      },
      {
        name: "IX_T_shareholder_6",
        fields: [
          { name: "regcode" },
          { name: "orig_st" },
        ]
      },
      {
        name: "IX_T_shareholder_7",
        fields: [
          { name: "regcode" },
          { name: "deceased" },
        ]
      },
      {
        name: "IX_T_shareholder_8",
        fields: [
          { name: "regcode" },
          { name: "chn" },
        ]
      },
      {
        name: "IX_T_shareholder_9",
        fields: [
          { name: "regcode" },
          { name: "typer" },
        ]
      },
      {
        name: "IX_T_shareholder14",
        fields: [
          { name: "regcode" },
          { name: "chn" },
        ]
      },
      {
        name: "IX_T_shareholder15",
        fields: [
          { name: "chn" },
        ]
      },
      {
        name: "IX_T_shareholder16",
        fields: [
          { name: "gsm_subs_dt" },
        ]
      },
      {
        name: "IX_T_shareholder17",
        fields: [
          { name: "gsm_enabled" },
        ]
      },
      {
        name: "IX_T_shold_14",
        fields: [
          { name: "agent" },
        ]
      },
      {
        name: "pk_shold",
        unique: true,
        fields: [
          { name: "auto" },
        ]
      },
      {
        name: "withholding_tax-6",
        fields: [
          { name: "Acctno" },
        ]
      },
    ]
  });
  return T_shold;
  }
}
