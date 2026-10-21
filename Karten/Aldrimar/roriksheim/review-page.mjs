import data from './transfer.generated.json' with {type:'json'};
import { mountTransferReview } from '../../modules/territory-transfer/transfer-review.mjs';
mountTransferReview(document.querySelector('[data-transfer-review]'),data);
