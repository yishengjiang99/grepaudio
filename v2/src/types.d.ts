export type Frequency = number;

export type Filter = {
  frequency: Frequency;
  q: number;
};

export type ADSR = number[];
export type Percent = number; //TODO: put conditional guards here when I figure out how to do them
