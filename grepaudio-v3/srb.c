
#include <stdint.h>
#define SIXTEEN_PAGES 16 * 4096
typedef struct
{
    uint16_t size;
    uint16_t rPtr;
    uint16_t wPtr;
    uint32_t lastUpdate;
    uint32_t data[SIXTEEN_PAGES];
} SharedRingBuffer;